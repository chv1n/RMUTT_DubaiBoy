import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductPlan } from '../entities/product-plan.entity';
import { PlanMaterialAllocation } from '../entities/plan-material-allocation.entity';
import { PlanStatusEnum } from '../enum/plan-status.enum';
import { ConfirmPlanDto, MaterialAllocationItemDto } from '../dto/confirm-plan.dto';
import { CompletePlanDto } from '../dto/complete-plan.dto';
import { CancelPlanDto } from '../dto/cancel-plan.dto';
import { StockReservationService, IStockOperation } from './stock-reservation.service';
import { BomService } from 'src/modules/bom/bom.service';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { AuditAction } from 'src/modules/audit-log/enums/audit-action.enum';
import { AuditEntity } from 'src/modules/audit-log/enums/audit-entity.enum';
import { MaterialInventory } from 'src/modules/material-inventory/entities/material-inventory.entity';
import { IPlanPreview, IMaterialRequirement, IWarehouseStock } from '../interfaces';
import { MaterialService } from 'src/modules/material/services/material.service';
import { TransactionMovementService } from 'src/modules/inventory-transaction/services/transaction-movement.service';

/**
 * Service สำหรับจัดการ Plan Workflow
 * 
 * Single Responsibility: จัดการ state transitions ของ Plan
 * Open/Closed: ขยายได้ผ่าน status enum
 * Dependency Inversion: Inject dependencies ผ่าน constructor
 */
@Injectable()
export class PlanWorkflowService {
    constructor(
        @InjectRepository(ProductPlan)
        private readonly planRepository: Repository<ProductPlan>,
        @InjectRepository(PlanMaterialAllocation)
        private readonly allocationRepository: Repository<PlanMaterialAllocation>,
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepository: Repository<MaterialInventory>,
        private readonly dataSource: DataSource,
        private readonly stockReservationService: StockReservationService,
        private readonly bomService: BomService,
        private readonly materialService: MaterialService,
        private readonly auditLogService: AuditLogService,
        private readonly transactionMovementService: TransactionMovementService,
    ) { }

    /**
     * Preview Plan - คำนวณวัสดุที่ต้องใช้ + ต้นทุน + แสดง stock แต่ละ warehouse
     */
    async previewPlan(planId: number): Promise<IPlanPreview> {
        const plan = await this.planRepository.findOne({
            where: { id: planId },
            relations: ['product'],
        });

        if (!plan) {
            throw new NotFoundException(`Plan with ID ${planId} not found`);
        }

        // คำนวณวัสดุที่ต้องใช้จาก BOM (รวม scrap factor)
        const bomRequirements = await this.bomService.calculateMaterialRequirement(
            plan.product_id,
            plan.input_quantity
        );

        console.log('bomRequirements', bomRequirements);

        const materials: IMaterialRequirement[] = [];
        let totalEstimatedCost = 0;

        for (const req of bomRequirements) {
            // ดึงข้อมูล material พร้อม cost
            const material = await this.materialService.findOne(req.material_id);
            const unitCost = Number(material?.cost_per_unit) || 0;
            const totalCost = req.required_quantity * unitCost;
            totalEstimatedCost += totalCost;

            // ดึง stock แต่ละ warehouse (ให้ user เลือก)
            const stockByWarehouse = await this.getStockByWarehouse(req.material_id);

            materials.push({
                material_id: req.material_id,
                material_name: req.material_name,
                unit_id: req.unit_id,
                unit_name: req.unit_name,
                // Calculation Details
                usage_per_piece: req.usage_per_piece,
                scrap_factor: req.scrap_factor,
                production_quantity: req.production_quantity,
                net_quantity: req.net_quantity,
                scrap_quantity: req.scrap_quantity,
                required_quantity: req.required_quantity,
                // Cost
                unit_cost: unitCost,
                total_cost: Math.round(totalCost * 100) / 100,
                // Stock
                stock_by_warehouse: stockByWarehouse,
            });
        }

        return {
            plan_id: planId,
            plan_name: plan.plan_name,
            product_id: plan.product_id,
            input_quantity: plan.input_quantity,
            materials,
            estimated_cost: Math.round(totalEstimatedCost * 100) / 100,
        };
    }

    /**
     * ดึง stock ของ material แยกตาม warehouse
     * ใช้ TypeORM QueryBuilder แทน raw SQL
     */
    private async getStockByWarehouse(materialId: number): Promise<IWarehouseStock[]> {
        const inventories = await this.inventoryRepository
            .createQueryBuilder('mi')
            .innerJoinAndSelect('mi.warehouse', 'wm')
            .where('mi.material = :materialId', { materialId })
            .andWhere('mi.deleted_at IS NULL')
            .andWhere('(mi.quantity - mi.reserved_quantity) > 0')
            .orderBy('wm.warehouse_name', 'ASC')
            .getMany();

        return inventories.map((inv) => ({
            inventory_id: inv.id,
            warehouse_id: inv.warehouse.id,
            warehouse_name: inv.warehouse.warehouse_name,
            available_quantity: inv.quantity - inv.reserved_quantity,
        }));
    }

    /**
     * Confirm Plan - จอง stock ตาม allocations ที่ user เลือก
     * Status: (any) -> PENDING
     */
    async confirmPlan(planId: number, dto: ConfirmPlanDto, userId?: number): Promise<ProductPlan> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const plan = await queryRunner.manager.findOne(ProductPlan, {
                where: { id: planId },
                relations: ['product'],
            });

            if (!plan) {
                throw new NotFoundException(`Plan with ID ${planId} not found`);
            }

            // ป้องกัน confirm ซ้ำ - ต้องเป็น DRAFT เท่านั้น
            if (plan.plan_status !== PlanStatusEnum.DRAFT) {
                throw new BadRequestException(
                    `Cannot confirm plan. Status must be DRAFT, current: ${plan.plan_status}`
                );
            }

            // ลบ allocations เก่า (ถ้ามี) เพื่อป้องกัน duplicate
            await queryRunner.manager.delete(PlanMaterialAllocation, { plan_id: planId });

            // Validate allocations match BOM requirements
            const preview = await this.previewPlan(planId);
            this.validateAllocations(dto.allocations, preview.materials);

            // Find inventory_id for each allocation and reserve stock
            const stockOps: IStockOperation[] = [];
            const allocationRecords: Array<{
                material_id: number;
                warehouse_id: number;
                inventory_id: number;
                quantity: number;
                unit_cost: number;
            }> = [];

            for (const alloc of dto.allocations) {
                // หา inventory จาก material_id + warehouse_id
                const inventory = await this.inventoryRepository.findOne({
                    where: {
                        material: { material_id: alloc.material_id },
                        warehouse: { id: alloc.warehouse_id },
                    },
                });

                if (!inventory) {
                    throw new BadRequestException(
                        `Inventory not found for Material ID ${alloc.material_id} in Warehouse ID ${alloc.warehouse_id}`
                    );
                }

                // ตรวจสอบ stock พอไหม
                const availableQty = inventory.quantity - inventory.reserved_quantity;
                if (availableQty < alloc.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for Material ID ${alloc.material_id} in Warehouse ID ${alloc.warehouse_id}. ` +
                        `Available: ${availableQty}, Required: ${alloc.quantity}`
                    );
                }

                const material = await this.materialService.findOne(alloc.material_id);
                const unitCost = Number(material?.cost_per_unit) || 0;

                stockOps.push({
                    inventory_id: inventory.id,
                    quantity: alloc.quantity,
                });

                allocationRecords.push({
                    material_id: alloc.material_id,
                    warehouse_id: alloc.warehouse_id,
                    inventory_id: inventory.id,
                    quantity: alloc.quantity,
                    unit_cost: unitCost,
                });
            }

            // Reserve stock
            await this.stockReservationService.reserveStock(stockOps, queryRunner);

            // Check Low Stock (Notify based on Available Quantity)
            for (const op of stockOps) {
                const updatedInventory = await queryRunner.manager.findOne(MaterialInventory, {
                    where: { id: op.inventory_id },
                    relations: ['material']
                });
                if (updatedInventory) {
                    // Pass 'true' to use Available Quantity = (Qty - Reserved)
                    // Note: We don't await this to avoid blocking the transaction commit? 
                    // Actually, checkLowStockAndNotify is async but just sends push. 
                    // It is better to await to ensure logs appear in order, but failures shouldn't allow rollback?
                    // transactionMovementService catches its own errors, so it won't throw. Safe to await.
                    await this.transactionMovementService.checkLowStockAndNotify(updatedInventory, true);
                }
            }

            // Create allocation records
            for (const record of allocationRecords) {
                const allocation = this.allocationRepository.create({
                    plan_id: planId,
                    material_id: record.material_id,
                    warehouse_id: record.warehouse_id,
                    inventory_id: record.inventory_id,
                    allocated_quantity: record.quantity,
                    unit_cost: record.unit_cost,
                });
                await queryRunner.manager.save(allocation);
            }

            // Update plan
            plan.plan_status = PlanStatusEnum.PENDING;
            plan.estimated_cost = preview.estimated_cost;
            await queryRunner.manager.save(plan);

            await queryRunner.commitTransaction();

            // Audit log
            await this.auditLogService.logDataChange({
                userId: userId,
                action: AuditAction.PLAN_CONFIRMED,
                entityType: AuditEntity.PRODUCT_PLAN,
                entityId: planId.toString(),
                newValues: { allocations: dto.allocations, estimated_cost: preview.estimated_cost },
            });

            return plan;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Validate ว่า allocations ครบตาม BOM requirements
     */
    private validateAllocations(allocations: MaterialAllocationItemDto[], requirements: IMaterialRequirement[]): void {
        for (const req of requirements) {
            const allocs = allocations.filter(a => a.material_id === req.material_id);
            const totalAllocated = allocs.reduce((sum, a) => sum + a.quantity, 0);

            if (totalAllocated < req.required_quantity) {
                throw new BadRequestException(
                    `Insufficient allocation for material ${req.material_name}. ` +
                    `Required: ${req.required_quantity}, Allocated: ${totalAllocated}`
                );
            }
        }
    }

    /**
     * Start Production - ตัด stock จริง
     * Status: PENDING -> PRODUCTION
     */
    async startProduction(planId: number, userId?: number): Promise<ProductPlan> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const plan = await queryRunner.manager.findOne(ProductPlan, {
                where: { id: planId },
                relations: ['material_allocations'],
            });

            if (!plan) {
                throw new NotFoundException(`Plan with ID ${planId} not found`);
            }

            if (plan.plan_status !== PlanStatusEnum.PENDING) {
                throw new BadRequestException(
                    `Cannot start production. Plan status must be PENDING, current: ${plan.plan_status}`
                );
            }

            // Deduct stock
            const stockOps: IStockOperation[] = plan.material_allocations.map(a => ({
                inventory_id: a.inventory_id,
                quantity: Number(a.allocated_quantity),
            }));

            // Debug: ตรวจสอบว่าดึง allocations มาถูก plan ไหม
            console.log(`[startProduction] Plan ID: ${planId}`);
            console.log(`[startProduction] Allocations count: ${plan.material_allocations.length}`);
            console.log(`[startProduction] Allocations:`, plan.material_allocations.map(a => ({
                plan_id: a.plan_id,
                inventory_id: a.inventory_id,
                allocated_quantity: a.allocated_quantity,
            })));
            console.log(`[startProduction] Stock Operations:`, stockOps);

            await this.stockReservationService.deductStock(stockOps, queryRunner);

            // Update plan
            plan.plan_status = PlanStatusEnum.PRODUCTION;
            plan.started_at = new Date();
            await queryRunner.manager.save(plan);

            await queryRunner.commitTransaction();

            // Audit log
            await this.auditLogService.logDataChange({
                userId: userId,
                action: AuditAction.PLAN_STARTED,
                entityType: AuditEntity.PRODUCT_PLAN,
                entityId: planId.toString(),
                oldValues: { status: PlanStatusEnum.PENDING },
                newValues: { status: PlanStatusEnum.PRODUCTION, started_at: plan.started_at },
            });

            return plan;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Complete Plan - บันทึกจำนวนที่ผลิตได้จริง, คำนวณ actual cost, คืนวัสดุเหลือ
     * Status: PRODUCTION -> COMPLETED
     */
    async completePlan(planId: number, dto: CompletePlanDto, userId?: number): Promise<ProductPlan> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const plan = await queryRunner.manager.findOne(ProductPlan, {
                where: { id: planId },
                relations: ['material_allocations'],
            });

            if (!plan) {
                throw new NotFoundException(`Plan with ID ${planId} not found`);
            }

            if (plan.plan_status !== PlanStatusEnum.PRODUCTION) {
                throw new BadRequestException(
                    `Cannot complete. Plan status must be PRODUCTION, current: ${plan.plan_status}`
                );
            }

            // คำนวณ material used และ returned
            const { usedQuantities, returnedQuantities, actualCost } = this.calculateMaterialUsage(
                plan.material_allocations,
                dto.actual_produced_quantity,
                plan.input_quantity
            );

            // คืน stock ที่เหลือ
            const returnOps: IStockOperation[] = [];
            for (const alloc of plan.material_allocations) {
                const returned = returnedQuantities.get(alloc.id) || 0;
                const used = usedQuantities.get(alloc.id) || 0;

                if (returned > 0) {
                    returnOps.push({ inventory_id: alloc.inventory_id, quantity: returned });
                }

                // Update allocation record
                alloc.used_quantity = used;
                alloc.returned_quantity = returned;
                await queryRunner.manager.save(alloc);
            }

            if (returnOps.length > 0) {
                await this.stockReservationService.returnStock(returnOps, queryRunner);
            }

            // Update plan
            plan.plan_status = PlanStatusEnum.COMPLETED;
            plan.actual_produced_quantity = dto.actual_produced_quantity;
            plan.actual_cost = actualCost;
            plan.completed_at = new Date();
            await queryRunner.manager.save(plan);

            await queryRunner.commitTransaction();

            // Audit log
            await this.auditLogService.logDataChange({
                userId: userId,
                action: AuditAction.PLAN_COMPLETED,
                entityType: AuditEntity.PRODUCT_PLAN,
                entityId: planId.toString(),
                newValues: {
                    actual_produced_quantity: dto.actual_produced_quantity,
                    actual_cost: actualCost,
                    returned_materials: returnOps,
                },
            });

            return plan;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Cancel Plan - ยกเลิก plan และคืน stock
     * Status: PENDING -> CANCELLED (คืน reserved ทั้งหมด)
     * Status: PRODUCTION -> CANCELLED (คืนตามสัดส่วน)
     */
    async cancelPlan(planId: number, dto: CancelPlanDto, userId?: number): Promise<ProductPlan> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const plan = await queryRunner.manager.findOne(ProductPlan, {
                where: { id: planId },
                relations: ['material_allocations'],
            });

            if (!plan) {
                throw new NotFoundException(`Plan with ID ${planId} not found`);
            }

            if (plan.plan_status === PlanStatusEnum.COMPLETED) {
                throw new BadRequestException('Cannot cancel a completed plan');
            }

            if (plan.plan_status === PlanStatusEnum.CANCELLED) {
                throw new BadRequestException('Plan is already cancelled');
            }

            if (plan.plan_status === PlanStatusEnum.PENDING) {
                // Validation: PENDING ห้ามส่ง actual_produced_quantity (เพราะยังไม่ได้ผลิต)
                if (dto.actual_produced_quantity !== undefined && dto.actual_produced_quantity !== 0) {
                    throw new BadRequestException(
                        'actual_produced_quantity should not be provided when cancelling from PENDING status (production has not started)'
                    );
                }

                // คืน reserved ทั้งหมด
                const releaseOps: IStockOperation[] = plan.material_allocations.map(a => ({
                    inventory_id: a.inventory_id,
                    quantity: Number(a.allocated_quantity),
                }));
                await this.stockReservationService.releaseReservation(releaseOps, queryRunner);

                // Update allocations
                for (const alloc of plan.material_allocations) {
                    alloc.returned_quantity = Number(alloc.allocated_quantity);
                    await queryRunner.manager.save(alloc);
                }
            } else if (plan.plan_status === PlanStatusEnum.PRODUCTION) {
                // Validation: ต้องกรอก actual_produced_quantity
                if (dto.actual_produced_quantity === undefined) {
                    throw new BadRequestException(
                        'actual_produced_quantity is required when cancelling from PRODUCTION status'
                    );
                }

                // Validation: ห้ามเกิน input_quantity (ไม่สามารถผลิตได้มากกว่าที่วางแผน)
                if (dto.actual_produced_quantity > plan.input_quantity) {
                    throw new BadRequestException(
                        `actual_produced_quantity (${dto.actual_produced_quantity}) cannot exceed input_quantity (${plan.input_quantity})`
                    );
                }

                // คำนวณวัสดุที่ใช้ไปและที่เหลือ
                const { usedQuantities, returnedQuantities, actualCost } = this.calculateMaterialUsage(
                    plan.material_allocations,
                    dto.actual_produced_quantity,
                    plan.input_quantity
                );

                // คืน stock ที่เหลือ
                const returnOps: IStockOperation[] = [];
                for (const alloc of plan.material_allocations) {
                    const returned = returnedQuantities.get(alloc.id) || 0;
                    const used = usedQuantities.get(alloc.id) || 0;

                    if (returned > 0) {
                        returnOps.push({ inventory_id: alloc.inventory_id, quantity: returned });
                    }

                    alloc.used_quantity = used;
                    alloc.returned_quantity = returned;
                    await queryRunner.manager.save(alloc);
                }

                if (returnOps.length > 0) {
                    await this.stockReservationService.returnStock(returnOps, queryRunner);
                }

                plan.actual_produced_quantity = dto.actual_produced_quantity;
                plan.actual_cost = actualCost;
            }

            // Update plan
            plan.plan_status = PlanStatusEnum.CANCELLED;
            plan.cancelled_at = new Date();
            plan.cancel_reason = dto.reason;
            await queryRunner.manager.save(plan);

            await queryRunner.commitTransaction();

            // Audit log
            await this.auditLogService.logDataChange({
                userId: userId,
                action: AuditAction.PLAN_CANCELLED,
                entityType: AuditEntity.PRODUCT_PLAN,
                entityId: planId.toString(),
                newValues: {
                    reason: dto.reason,
                    actual_produced_quantity: dto.actual_produced_quantity,
                },
            });

            return plan;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * คำนวณวัสดุที่ใช้จริงและที่เหลือ ตามสัดส่วนการผลิต
     */
    private calculateMaterialUsage(
        allocations: PlanMaterialAllocation[],
        actualProduced: number,
        inputQuantity: number
    ): {
        usedQuantities: Map<number, number>;
        returnedQuantities: Map<number, number>;
        actualCost: number;
    } {
        const ratio = actualProduced / inputQuantity;
        const usedQuantities = new Map<number, number>();
        const returnedQuantities = new Map<number, number>();
        let actualCost = 0;

        for (const alloc of allocations) {
            const allocated = Number(alloc.allocated_quantity);
            const used = Math.round(allocated * ratio * 1000) / 1000;
            const returned = Math.round((allocated - used) * 1000) / 1000;

            usedQuantities.set(alloc.id, used);
            returnedQuantities.set(alloc.id, returned);
            actualCost += used * Number(alloc.unit_cost);
        }

        return {
            usedQuantities,
            returnedQuantities,
            actualCost: Math.round(actualCost * 100) / 100,
        };
    }
}
