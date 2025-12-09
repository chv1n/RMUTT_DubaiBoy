import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { MaterialInventory } from '../../material-inventory/entities/material-inventory.entity';
import { WarehouseMaster } from '../../warehouse-master/entities/warehouse-master.entity';
import { MovementHistoryQueryDto, MovementHistoryResponseDto } from '../dto/movement-history.dto';
import { InventoryTurnoverQueryDto, InventoryTurnoverResponseDto } from '../dto/inventory-turnover.dto';
import { TraceabilityQueryDto, TraceabilityResponseDto } from '../dto/traceability.dto';
import { StockLocationQueryDto, StockLocationResponseDto } from '../dto/stock-location.dto';
import { TransactionType } from '../../../common/enums';

/**
 * Service สำหรับรายงานและการสอบย้อนกลับ (Reporting & Traceability)
 * รับผิดชอบ: Movement History, Inventory Turnover, Traceability, Stock Location
 * 
 * หลัก SOLID:
 * - Single Responsibility: เฉพาะเรื่อง Reporting เท่านั้น
 * - Interface Segregation: แยก method สำหรับแต่ละประเภทรายงาน
 */
@Injectable()
export class ReportingService {
    constructor(
        @InjectRepository(InventoryTransaction)
        private readonly transactionRepository: Repository<InventoryTransaction>,
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepository: Repository<MaterialInventory>,
        @InjectRepository(WarehouseMaster)
        private readonly warehouseRepository: Repository<WarehouseMaster>,
    ) { }

    /**
     * รายงานประวัติการเคลื่อนไหว (Movement History Report)
     * แสดงประวัติการเข้า-ออกของวัสดุย้อนหลัง
     */
    async getMovementHistory(query: MovementHistoryQueryDto): Promise<{
        data: MovementHistoryResponseDto[];
        meta: any;
        summary: { total_in: number; total_out: number; net_change: number };
    }> {
        const qb = this.createBaseTransactionQuery()
            .andWhere('material.material_id = :materialId', { materialId: query.material_id });

        if (query.warehouse_id) {
            qb.andWhere('warehouse.id = :warehouseId', { warehouseId: query.warehouse_id });
        }

        if (query.transaction_type) {
            qb.andWhere('transaction.transaction_type = :type', { type: query.transaction_type });
        }

        this.applyDateFilters(qb, query.start_date, query.end_date);

        const page = query.page || 1;
        const limit = query.limit || 20;

        const [transactions, total] = await qb
            .orderBy('transaction.transaction_date', 'DESC')
            .addOrderBy('transaction.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        // Calculate summary
        const summaryQb = this.createBaseTransactionQuery()
            .select('SUM(CASE WHEN transaction.quantity_change > 0 THEN transaction.quantity_change ELSE 0 END)', 'total_in')
            .addSelect('SUM(CASE WHEN transaction.quantity_change < 0 THEN ABS(transaction.quantity_change) ELSE 0 END)', 'total_out')
            .addSelect('SUM(transaction.quantity_change)', 'net_change')
            .andWhere('material.material_id = :materialId', { materialId: query.material_id });

        if (query.warehouse_id) {
            summaryQb.andWhere('warehouse.id = :warehouseId', { warehouseId: query.warehouse_id });
        }
        this.applyDateFilters(summaryQb, query.start_date, query.end_date);

        const summaryResult = await summaryQb.getRawOne();

        const data: MovementHistoryResponseDto[] = transactions.map(t => ({
            transaction_id: t.id,
            material_id: t.materialInventory.material.material_id,
            material_name: t.materialInventory.material.material_name,
            warehouse_id: t.warehouse.id,
            warehouse_name: t.warehouse.warehouse_name,
            transaction_type: t.transaction_type as TransactionType,
            quantity_change: t.quantity_change,
            reference_number: t.reference_number,
            reason_remarks: t.reason_remarks,
            transaction_date: t.transaction_date,
            created_at: t.created_at,
        }));

        return {
            data,
            meta: this.createPaginationMeta(total, transactions.length, limit, page),
            summary: {
                total_in: parseFloat(summaryResult?.total_in) || 0,
                total_out: parseFloat(summaryResult?.total_out) || 0,
                net_change: parseFloat(summaryResult?.net_change) || 0,
            },
        };
    }

    /**
     * รายงานการหมุนเวียนของสินค้า (Inventory Turnover)
     * วิเคราะห์ว่าวัสดุมีการหมุนเวียนรวดเร็วเพียงใด
     */
    async getInventoryTurnover(query: InventoryTurnoverQueryDto): Promise<{
        data: InventoryTurnoverResponseDto[];
        meta: any;
    }> {
        const qb = this.inventoryRepository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.material', 'material')
            .leftJoinAndSelect('inventory.warehouse', 'warehouse')
            .where('material.is_active = :isActive', { isActive: true })
            .andWhere('warehouse.is_active = :warehouseActive', { warehouseActive: true });

        if (query.material_id) {
            qb.andWhere('material.material_id = :materialId', { materialId: query.material_id });
        }

        if (query.warehouse_id) {
            qb.andWhere('warehouse.id = :warehouseId', { warehouseId: query.warehouse_id });
        }

        const page = query.page || 1;
        const limit = query.limit || 20;

        const [inventories, total] = await qb
            .orderBy('material.material_name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        // Calculate turnover for each inventory
        const data: InventoryTurnoverResponseDto[] = await Promise.all(
            inventories.map(async (inv) => {
                const turnoverData = await this.calculateTurnoverForInventory(
                    inv,
                    query.start_date,
                    query.end_date,
                );
                return turnoverData;
            })
        );

        return {
            data,
            meta: this.createPaginationMeta(total, inventories.length, limit, page),
        };
    }

    /**
     * การสอบย้อนกลับ (Traceability)
     * ติดตามย้อนกลับไปถึงแหล่งที่มาหรือการใช้งานของวัสดุ
     */
    async getTraceability(query: TraceabilityQueryDto): Promise<{
        data: TraceabilityResponseDto[];
        meta: any;
    }> {
        const qb = this.createBaseTransactionQuery();

        if (query.reference_number) {
            qb.andWhere('transaction.reference_number ILIKE :ref', { ref: `%${query.reference_number}%` });
        }

        if (query.order_number) {
            qb.andWhere('inventory.order_number ILIKE :order', { order: `%${query.order_number}%` });
        }

        if (query.material_id) {
            qb.andWhere('material.material_id = :materialId', { materialId: query.material_id });
        }

        this.applyDateFilters(qb, query.start_date, query.end_date);

        const page = query.page || 1;
        const limit = query.limit || 20;

        const transactions = await qb
            .orderBy('transaction.transaction_date', 'DESC')
            .getMany();

        // Group by reference_number
        const groupedByRef = new Map<string, typeof transactions>();
        transactions.forEach(t => {
            const ref = t.reference_number || 'NO_REFERENCE';
            if (!groupedByRef.has(ref)) {
                groupedByRef.set(ref, []);
            }
            groupedByRef.get(ref)!.push(t);
        });

        const allResults = Array.from(groupedByRef.entries()).map(([ref, txns]) => {
            const relatedOrders = new Set<string>();
            txns.forEach(t => {
                if (t.materialInventory?.order_number) {
                    relatedOrders.add(t.materialInventory.order_number);
                }
            });

            return {
                reference_number: ref,
                transactions: txns.map(t => ({
                    transaction_id: t.id,
                    material_id: t.materialInventory.material.material_id,
                    material_name: t.materialInventory.material.material_name,
                    warehouse_id: t.warehouse.id,
                    warehouse_name: t.warehouse.warehouse_name,
                    transaction_type: t.transaction_type as TransactionType,
                    quantity_change: t.quantity_change,
                    transaction_date: t.transaction_date,
                    reason_remarks: t.reason_remarks,
                })),
                related_orders: Array.from(relatedOrders),
            };
        });

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedResults = allResults.slice(startIndex, startIndex + limit);

        return {
            data: paginatedResults,
            meta: this.createPaginationMeta(allResults.length, paginatedResults.length, limit, page),
        };
    }

    /**
     * รายงานยอดคงคลังตามสถานที่ (Stock Location Report)
     * แสดงรายการวัสดุทั้งหมดในโกดังที่ระบุ
     */
    async getStockByLocation(query: StockLocationQueryDto): Promise<StockLocationResponseDto> {
        const warehouse = await this.warehouseRepository.findOne({
            where: { id: query.warehouse_id },
        });

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${query.warehouse_id} not found`);
        }

        const qb = this.inventoryRepository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.material', 'material')
            .leftJoinAndSelect('inventory.warehouse', 'warehouse')
            .where('warehouse.id = :warehouseId', { warehouseId: query.warehouse_id })
            .andWhere('inventory.quantity > 0');

        if (query.search) {
            qb.andWhere('material.material_name ILIKE :search', { search: `%${query.search}%` });
        }

        const sortColumn = query.sort_by === 'quantity' ? 'inventory.quantity' : 'material.material_name';
        const sortOrder = query.sort_order?.toUpperCase() as 'ASC' | 'DESC' || 'ASC';

        qb.orderBy(sortColumn, sortOrder);

        const page = query.page || 1;
        const limit = query.limit || 20;

        const [inventories, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            warehouse_id: warehouse.id,
            warehouse_name: warehouse.warehouse_name,
            warehouse_code: warehouse.warehouse_code,
            materials: inventories.map(inv => ({
                material_id: inv.material.material_id,
                material_name: inv.material.material_name,
                quantity: inv.quantity,
                mfg_date: inv.mfg_date,
                exp_date: inv.exp_date,
                order_number: inv.order_number,
            })),
            total_items: total,
        };
    }

    // ============ Private Helper Methods ============

    private createBaseTransactionQuery(): SelectQueryBuilder<InventoryTransaction> {
        return this.transactionRepository.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.materialInventory', 'inventory')
            .leftJoinAndSelect('inventory.material', 'material')
            .leftJoinAndSelect('transaction.warehouse', 'warehouse')
            .where('transaction.deleted_at IS NULL');
    }

    private applyDateFilters(
        qb: SelectQueryBuilder<InventoryTransaction>,
        startDate?: Date,
        endDate?: Date,
    ): void {
        if (startDate && endDate) {
            qb.andWhere('transaction.transaction_date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        } else if (startDate) {
            qb.andWhere('transaction.transaction_date >= :startDate', { startDate });
        } else if (endDate) {
            qb.andWhere('transaction.transaction_date <= :endDate', { endDate });
        }
    }

    private async calculateTurnoverForInventory(
        inventory: MaterialInventory,
        startDate?: Date,
        endDate?: Date,
    ): Promise<InventoryTurnoverResponseDto> {
        // Get average inventory over the period
        const currentInventory = inventory.quantity;

        // Get total outgoing quantity
        const outQb = this.transactionRepository.createQueryBuilder('transaction')
            .select('SUM(ABS(transaction.quantity_change))', 'total_out')
            .where('transaction.materialInventory = :invId', { invId: inventory.id })
            .andWhere('transaction.quantity_change < 0');

        if (startDate) {
            outQb.andWhere('transaction.transaction_date >= :startDate', { startDate });
        }
        if (endDate) {
            outQb.andWhere('transaction.transaction_date <= :endDate', { endDate });
        }

        const outResult = await outQb.getRawOne();
        const totalOutQuantity = parseFloat(outResult?.total_out) || 0;

        // Calculate average inventory (simplified: current + total_out / 2)
        const averageInventory = (currentInventory + (currentInventory + totalOutQuantity)) / 2;

        // Calculate turnover rate
        const turnoverRate = averageInventory > 0 ? totalOutQuantity / averageInventory : 0;

        // Calculate days in inventory
        const daysInInventory = turnoverRate > 0 ? 365 / turnoverRate : 0;

        return {
            material_id: inventory.material.material_id,
            material_name: inventory.material.material_name,
            warehouse_id: inventory.warehouse.id,
            warehouse_name: inventory.warehouse.warehouse_name,
            average_inventory: Math.round(averageInventory * 100) / 100,
            total_out_quantity: totalOutQuantity,
            turnover_rate: Math.round(turnoverRate * 100) / 100,
            days_in_inventory: Math.round(daysInInventory),
        };
    }

    private createPaginationMeta(
        total: number,
        itemCount: number,
        limit: number,
        page: number,
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
