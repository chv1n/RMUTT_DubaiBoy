import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from '../dto/purchase-order.dto';
import { MaterialMaster } from '../../material/entities/material-master.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { ProductPlan } from '../../product-plan/entities/product-plan.entity';
import { PlanStatusEnum } from '../../product-plan/enum/plan-status.enum';

export interface Recommendation {
    material: MaterialMaster;
    reason: string;
    suggested_quantity: number;
}

export interface DelayImpact {
    plan_id: number;
    plan_name: string;
    material_name: string;
    conflict_reason: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Injectable()
export class PurchaseOrderService {
    constructor(
        @InjectRepository(PurchaseOrder)
        private poRepository: Repository<PurchaseOrder>,
        @InjectRepository(PurchaseOrderItem)
        private poItemRepository: Repository<PurchaseOrderItem>,
        @InjectRepository(MaterialMaster)
        private materialRepository: Repository<MaterialMaster>,
        @InjectRepository(Supplier)
        private supplierRepository: Repository<Supplier>,
        @InjectRepository(ProductPlan)
        private planRepository: Repository<ProductPlan>,
    ) { }

    async create(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
        const po = new PurchaseOrder();
        po.supplier_id = createDto.supplier_id;
        po.order_date = new Date(createDto.order_date);
        po.expected_delivery_date = new Date(createDto.expected_delivery_date);
        po.notes = createDto.notes || '';
        po.po_number = `PO-${Date.now()}`;

        let total = 0;
        po.items = createDto.items.map(itemDto => {
            const item = new PurchaseOrderItem();
            item.material_id = itemDto.material_id;
            item.quantity = itemDto.quantity;
            item.unit_price = itemDto.unit_price;
            item.subtotal = itemDto.quantity * itemDto.unit_price;
            total += item.subtotal;
            return item;
        });
        po.total_amount = total;

        return this.poRepository.save(po);
    }

    async findAll(): Promise<PurchaseOrder[]> {
        return this.poRepository.find({
            relations: ['supplier', 'items', 'items.material'],
            order: { created_at: 'DESC' }
        });
    }

    async findOne(id: number): Promise<PurchaseOrder> {
        const po = await this.poRepository.findOne({
            where: { po_id: id },
            relations: ['supplier', 'items', 'items.material']
        });
        if (!po) throw new NotFoundException(`PO #${id} not found`);
        return po;
    }

    async update(id: number, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
        const po = await this.findOne(id);

        if (updateDto.status) po.status = updateDto.status;
        if (updateDto.actual_delivery_date) po.actual_delivery_date = new Date(updateDto.actual_delivery_date);
        if (updateDto.expected_delivery_date) po.expected_delivery_date = new Date(updateDto.expected_delivery_date);

        if (updateDto.status === PurchaseOrderStatus.DELIVERED && !po.actual_delivery_date) {
            po.actual_delivery_date = new Date();
        }

        return this.poRepository.save(po);
    }

    async getSupplierPerformance(supplierId: number) {
        const pos = await this.poRepository.find({
            where: {
                supplier_id: supplierId,
                status: PurchaseOrderStatus.DELIVERED
            }
        });

        if (pos.length === 0) return { onTimeRate: 100, delayCount: 0, totalOrders: 0, avgDelayDays: 0 };

        let onTimeCount = 0;
        let totalDelayDays = 0;
        let delayCount = 0;

        pos.forEach(po => {
            if (po.actual_delivery_date <= po.expected_delivery_date) {
                onTimeCount++;
            } else {
                delayCount++;
                const diffTime = Math.abs(po.actual_delivery_date.getTime() - po.expected_delivery_date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDelayDays += diffDays;
            }
        });

        const onTimeRate = (onTimeCount / pos.length) * 100;
        const avgDelayDays = delayCount > 0 ? (totalDelayDays / delayCount) : 0;

        return {
            onTimeRate,
            delayCount,
            totalOrders: pos.length,
            avgDelayDays
        };
    }

    async getRecommendations(): Promise<Recommendation[]> {
        const materials = await this.materialRepository.find();
        const recommendations: Recommendation[] = [];

        for (const material of materials) {
            const pendingPO = await this.poItemRepository.findOne({
                where: {
                    material_id: material.material_id,
                    purchase_order: {
                        status: PurchaseOrderStatus.PENDING
                    }
                },
                relations: ['purchase_order']
            });

            if (!pendingPO) {
                recommendations.push({
                    material,
                    reason: "Low stock & No pending order",
                    suggested_quantity: material.container_max_stock || 100
                });
            }
        }

        return recommendations;
    }

    async getAlternativeSuppliers(currentSupplierId: number) {
        // 1. Get all active suppliers (except current)
        const suppliers = await this.supplierRepository.find({
            where: { is_active: true }
        });

        // 2. Calculate performance for each
        const alternatives: any[] = [];
        for (const s of suppliers) {
            if (s.supplier_id === Number(currentSupplierId)) continue;

            const performance = await this.getSupplierPerformance(s.supplier_id);
            alternatives.push({
                ...s,
                performance
            });
        }

        // 3. Rank by On-Time Rate (Desc) then Avg Delay (Asc) to find best backups
        return alternatives.sort((a, b) => {
            if (b.performance.onTimeRate !== a.performance.onTimeRate) {
                return b.performance.onTimeRate - a.performance.onTimeRate;
            }
            return a.performance.avgDelayDays - b.performance.avgDelayDays;
        }).slice(0, 5); // Return Top 5 candidates
    }

    async checkImpact(poId: number, newDate: string): Promise<DelayImpact[]> {
        const po = await this.findOne(poId);
        const deliveryDate = new Date(newDate);
        const impacts: DelayImpact[] = [];

        for (const item of po.items) {
            const activePlans = await this.planRepository.createQueryBuilder('plan')
                .leftJoinAndSelect('plan.material_allocations', 'allocation')
                .where('plan.plan_status IN (:...statuses)', { statuses: [PlanStatusEnum.PENDING, PlanStatusEnum.PRODUCTION] })
                .andWhere('allocation.material_id = :materialId', { materialId: item.material_id })
                .getMany();

            for (const plan of activePlans) {
                if (new Date(plan.start_date) < deliveryDate) {
                    impacts.push({
                        plan_id: plan.id,
                        plan_name: plan.plan_name,
                        material_name: item.material.material_name,
                        conflict_reason: `Plan starts on ${plan.start_date}, but material arrives on ${newDate}`,
                        severity: 'HIGH'
                    });
                }
            }
        }
        return impacts;
    }

    async seed() {
        const suppliers = await this.supplierRepository.find();
        if (suppliers.length === 0) return { message: "No suppliers found to seed." };

        const materials = await this.materialRepository.find();
        if (materials.length === 0) return { message: "No materials found to seed." };

        const oldPOs = await this.poRepository.count();
        if (oldPOs > 5) return { message: "Data already seeded." };

        const totalPOs = 50;
        const createdPOs: string[] = [];

        for (let i = 0; i < totalPOs; i++) {
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];

            const po = new PurchaseOrder();
            po.supplier_id = supplier.supplier_id;

            const daysAgo = Math.floor(Math.random() * 180);
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - daysAgo);
            po.order_date = orderDate;

            const leadTime = Math.floor(Math.random() * 5) + 5;
            const expectedDate = new Date(orderDate);
            expectedDate.setDate(orderDate.getDate() + leadTime);
            po.expected_delivery_date = expectedDate;

            po.po_number = `PO-SEED-${Date.now()}-${i}`;
            po.notes = "Seeded by system";

            const statusRand = Math.random();
            if (statusRand < 0.8) {
                po.status = PurchaseOrderStatus.DELIVERED;
                const actualDate = new Date(expectedDate);
                if (Math.random() > 0.3) {
                    actualDate.setDate(actualDate.getDate() - Math.floor(Math.random() * 2));
                } else {
                    actualDate.setDate(actualDate.getDate() + Math.floor(Math.random() * 10) + 1);
                }
                po.actual_delivery_date = actualDate;
            } else if (statusRand < 0.9) {
                po.status = PurchaseOrderStatus.PENDING;
            } else {
                po.status = PurchaseOrderStatus.DELAYED;
            }

            const item = new PurchaseOrderItem();
            item.material_id = material.material_id;
            item.quantity = Math.floor(Math.random() * 500) + 50;
            item.unit_price = material.cost_per_unit || 10;
            item.subtotal = item.quantity * item.unit_price;

            po.items = [item];
            po.total_amount = item.subtotal;

            await this.poRepository.save(po);
            createdPOs.push(po.po_number);
        }

        return { success: true, count: createdPOs.length, message: "Use GET /purchase-orders/supplier-performance/:id to check results." };
    }
}
