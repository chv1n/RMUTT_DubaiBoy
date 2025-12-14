import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, SelectQueryBuilder } from 'typeorm';
import { MaterialInventory } from '../entities/material-inventory.entity';
import { MaterialMaster } from '../../material/entities/material-master.entity';
import { WarehouseMaster } from '../../warehouse-master/entities/warehouse-master.entity';
import { StockByWarehouseQueryDto, StockByWarehouseResponseDto } from '../dto/stock-by-warehouse.dto';
import { TotalStockQueryDto, TotalStockResponseDto } from '../dto/total-stock.dto';
import { LotBatchQueryDto, LotBatchSuggestionDto } from '../dto/lot-batch.dto';
import { LowStockQueryDto, LowStockAlertResponseDto } from '../dto/low-stock-alert.dto';
import { LotStrategy } from '../../../common/enums';
import { InventoryTransaction } from 'src/modules/inventory-transaction/entities/inventory-transaction.entity';

/**
 * Service สำหรับจัดการยอดคงคลัง (Inventory Balance Control)
 * รับผิดชอบ: แสดงยอดคงคลัง, จัดการ Lot/Batch, แจ้งเตือนยอดต่ำสุด
 * 
 * หลัก SOLID:
 * - Single Responsibility: เฉพาะเรื่อง Inventory Balance เท่านั้น
 * - Open/Closed: ขยายได้ผ่าน LotStrategy enum
 * - Dependency Inversion: ใช้ Repository interface
 */
@Injectable()
export class InventoryBalanceService {
    constructor(
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepository: Repository<MaterialInventory>,
        @InjectRepository(MaterialMaster)
        private readonly materialRepository: Repository<MaterialMaster>,
        @InjectRepository(WarehouseMaster)
        private readonly warehouseRepository: Repository<WarehouseMaster>,
        @InjectRepository(InventoryTransaction)
        private readonly transactionRepository: Repository<InventoryTransaction>,
    ) { }

    /**
     * ดูยอดคงคลังตามโกดัง (Stock by Warehouse)
     * แสดงยอด Quantity ของวัสดุแต่ละชนิด แยกตาม WarehouseID
     */
    async getStockByWarehouse(query: StockByWarehouseQueryDto): Promise<{
        data: StockByWarehouseResponseDto[];
        meta: any;
    }> {
        const qb = this.createBaseInventoryQuery();

        // Apply filters
        if (query.material_id) {
            qb.andWhere('material.material_id = :materialId', { materialId: query.material_id });
        }

        if (query.warehouse_id) {
            qb.andWhere('warehouse.id = :warehouseId', { warehouseId: query.warehouse_id });
        }

        if (query.search) {
            qb.andWhere(
                '(material.material_name ILIKE :search OR warehouse.warehouse_name ILIKE :search)',
                { search: `%${query.search}%` }
            );
        }

        if (!query.include_zero_stock) {
            qb.andWhere('inventory.quantity > 0');
        }

        // Pagination
        const page = query.page || 1;
        const limit = query.limit || 20;

        const [items, total] = await qb
            .orderBy('material.material_name', 'ASC')
            .addOrderBy('warehouse.warehouse_name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const data: StockByWarehouseResponseDto[] = items.map(item => ({
            material_id: item.material.material_id,
            material_name: item.material.material_name,
            warehouse_id: item.warehouse.id,
            warehouse_name: item.warehouse.warehouse_name,
            quantity: item.quantity,
            mfg_date: item.mfg_date,
            exp_date: item.exp_date,
            order_number: item.order_number,
        }));

        return {
            data,
            meta: this.createPaginationMeta(total, items.length, limit, page),
        };
    }

    /**
     * ดูยอดคงคลังรวม (Total Stock View)
     * รวมยอด Quantity ของ MaterialID ชนิดหนึ่งๆ จากทุก Warehouse
     */
    async getTotalStock(query: TotalStockQueryDto): Promise<{
        data: TotalStockResponseDto[];
        meta: any;
    }> {
        const qb = this.materialRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.materialInventory', 'inventory')
            .leftJoin('inventory.warehouse', 'warehouse')
            .addSelect(['warehouse.id', 'warehouse.warehouse_name'])
            .where('material.is_active = :isActive', { isActive: true });

        if (query.material_id) {
            qb.andWhere('material.material_id = :materialId', { materialId: query.material_id });
        }

        if (query.material_name) {
            qb.andWhere('material.material_name ILIKE :name', { name: `%${query.material_name}%` });
        }

        if (query.search) {
            qb.andWhere('material.material_name ILIKE :search', { search: `%${query.search}%` });
        }

        const page = query.page || 1;
        const limit = query.limit || 20;

        const [materials, total] = await qb
            .orderBy('material.material_name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        // Get all inventory data for these materials grouped by warehouse
        const materialIds = materials.map(m => m.material_id);

        const inventoryData = materialIds.length > 0
            ? await this.inventoryRepository.createQueryBuilder('inventory')
                .leftJoinAndSelect('inventory.material', 'material')
                .leftJoinAndSelect('inventory.warehouse', 'warehouse')
                .where('material.material_id IN (:...materialIds)', { materialIds })
                .getMany()
            : [];

        // Group by material
        const inventoryMap = new Map<number, typeof inventoryData>();
        inventoryData.forEach(inv => {
            const materialId = inv.material.material_id;
            if (!inventoryMap.has(materialId)) {
                inventoryMap.set(materialId, []);
            }
            inventoryMap.get(materialId)!.push(inv);
        });

        const data: TotalStockResponseDto[] = materials.map(material => {
            const inventories = inventoryMap.get(material.material_id) || [];
            const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0);

            return {
                material_id: material.material_id,
                material_name: material.material_name,
                total_quantity: totalQuantity,
                warehouse_breakdown: inventories.map(inv => ({
                    warehouse_id: inv.warehouse.id,
                    warehouse_name: inv.warehouse.warehouse_name,
                    quantity: inv.quantity,
                })),
            };
        });

        return {
            data,
            meta: this.createPaginationMeta(total, materials.length, limit, page),
        };
    }

    /**
     * จัดการ Lot/Batch - ค้นหาและแนะนำวัสดุตามเงื่อนไข FIFO/FEFO
     */
    async getLotBatchSuggestion(query: LotBatchQueryDto): Promise<LotBatchSuggestionDto[]> {
        const qb = this.createBaseInventoryQuery()
            .andWhere('material.material_id = :materialId', { materialId: query.material_id })
            .andWhere('inventory.quantity > 0');

        if (query.warehouse_id) {
            qb.andWhere('warehouse.id = :warehouseId', { warehouseId: query.warehouse_id });
        }

        // Apply sorting based on strategy
        this.applyLotStrategy(qb, query.strategy || LotStrategy.FIFO);

        const inventories = await qb.getMany();

        if (inventories.length === 0) {
            throw new NotFoundException(`No inventory found for material ID ${query.material_id}`);
        }

        // If quantity_needed is specified, suggest optimal lots
        let remainingQuantity = query.quantity_needed || 0;

        return inventories.map(inv => {
            let suggestedQty = 0;

            if (query.quantity_needed) {
                if (remainingQuantity > 0) {
                    suggestedQty = Math.min(inv.quantity, remainingQuantity);
                    remainingQuantity -= suggestedQty;
                }
            }

            return {
                inventory_id: inv.id,
                material_id: inv.material.material_id,
                material_name: inv.material.material_name,
                warehouse_id: inv.warehouse.id,
                warehouse_name: inv.warehouse.warehouse_name,
                quantity: inv.quantity,
                mfg_date: inv.mfg_date,
                exp_date: inv.exp_date,
                order_number: inv.order_number,
                suggested_quantity: suggestedQty,
            };
        });
    }

    /**
     * ตรวจสอบและแจ้งเตือนยอดต่ำสุด (Low Stock Alert)
     * เปรียบเทียบกับ container_min_stock ใน MaterialMaster
     */
    async getLowStockAlerts(query: LowStockQueryDto): Promise<{
        data: LowStockAlertResponseDto[];
        meta: any;
    }> {
        const qb = this.inventoryRepository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.material', 'material')
            .leftJoinAndSelect('inventory.warehouse', 'warehouse')
            .where('material.is_active = :isActive', { isActive: true })
            .andWhere('warehouse.is_active = :warehouseActive', { warehouseActive: true });

        if (query.warehouse_id) {
            qb.andWhere('warehouse.id = :warehouseId', { warehouseId: query.warehouse_id });
        }

        // Filter where quantity is below reorder point (container_min_stock)
        // If custom threshold is provided, use it; otherwise use material's min_stock
        if (query.threshold !== undefined) {
            qb.andWhere('inventory.quantity <= :threshold', { threshold: query.threshold });
        } else {
            qb.andWhere('inventory.quantity <= material.container_min_stock');
        }

        const page = query.page || 1;
        const limit = query.limit || 20;

        const [items, total] = await qb
            .orderBy('inventory.quantity', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const data: LowStockAlertResponseDto[] = items.map(item => {
            const reorderPoint = item.material.container_min_stock || 0;
            const shortage = Math.max(0, reorderPoint - item.quantity);

            return {
                material_id: item.material.material_id,
                material_name: item.material.material_name,
                warehouse_id: item.warehouse.id,
                warehouse_name: item.warehouse.warehouse_name,
                current_quantity: item.quantity,
                reorder_point: reorderPoint,
                shortage_quantity: shortage,
                is_critical: item.quantity === 0 || item.quantity < reorderPoint * 0.5,
            };
        });

        return {
            data,
            meta: this.createPaginationMeta(total, items.length, limit, page),
        };
    }

    /**
     * ตรวจสอบยอดคงคลังว่าเพียงพอหรือไม่
     */
    async checkAvailableStock(
        materialId: number,
        warehouseId: number,
        requiredQuantity: number
    ): Promise<{ available: boolean; currentQuantity: number; shortage: number }> {
        const inventory = await this.inventoryRepository.findOne({
            where: {
                material: { material_id: materialId },
                warehouse: { id: warehouseId },
            },
        });

        const currentQuantity = inventory?.quantity || 0;
        const shortage = Math.max(0, requiredQuantity - currentQuantity);

        return {
            available: currentQuantity >= requiredQuantity,
            currentQuantity,
            shortage,
        };
    }

    // ============ Private Helper Methods ============

    private createBaseInventoryQuery(): SelectQueryBuilder<MaterialInventory> {
        return this.inventoryRepository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.material', 'material')
            .leftJoinAndSelect('inventory.warehouse', 'warehouse')
            .where('material.is_active = :isActive', { isActive: true })
            .andWhere('warehouse.is_active = :warehouseActive', { warehouseActive: true })
            .andWhere('inventory.deleted_at IS NULL');
    }

    private applyLotStrategy(
        qb: SelectQueryBuilder<MaterialInventory>,
        strategy: LotStrategy
    ): void {
        switch (strategy) {
            case LotStrategy.FIFO:
                qb.orderBy('inventory.mfg_date', 'ASC', 'NULLS LAST')
                    .addOrderBy('inventory.created_at', 'ASC');
                break;
            case LotStrategy.FEFO:
                qb.orderBy('inventory.exp_date', 'ASC', 'NULLS LAST')
                    .addOrderBy('inventory.mfg_date', 'ASC');
                break;
            case LotStrategy.LIFO:
                qb.orderBy('inventory.mfg_date', 'DESC', 'NULLS LAST')
                    .addOrderBy('inventory.created_at', 'DESC');
                break;
            default:
                qb.orderBy('inventory.mfg_date', 'ASC', 'NULLS LAST');
        }
    }

    private createPaginationMeta(
        total: number,
        itemCount: number,
        limit: number,
        page: number
    ) {
        return {
            totalItems: total,
            itemCount,
            itemsPerPage: limit,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }



}
