import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { MaterialInventory } from '../../material-inventory/entities/material-inventory.entity';
import { MaterialMaster } from '../../material/entities/material-master.entity';
import { WarehouseMaster } from '../../warehouse-master/entities/warehouse-master.entity';
import { GoodsReceiptDto } from '../dto/goods-receipt.dto';
import { GoodsIssueDto } from '../dto/goods-issue.dto';
import { WarehouseTransferDto, TransferResultDto } from '../dto/warehouse-transfer.dto';
import { InventoryAdjustmentDto } from '../dto/inventory-adjustment.dto';
import { TransactionType } from '../../../common/enums';

/**
 * Service สำหรับบันทึกรายการเคลื่อนไหว (Transaction & Movement)
 * รับผิดชอบ: Goods Receipt, Goods Issue, Transfer, Adjustment
 * 
 * หลัก SOLID:
 * - Single Responsibility: เฉพาะเรื่อง Transaction เท่านั้น
 * - Open/Closed: ขยายประเภท Transaction ได้ผ่าน TransactionType enum
 * - Dependency Inversion: ใช้ Repository interface
 */
@Injectable()
export class TransactionMovementService {
    constructor(
        @InjectRepository(InventoryTransaction)
        private readonly transactionRepository: Repository<InventoryTransaction>,
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepository: Repository<MaterialInventory>,
        @InjectRepository(MaterialMaster)
        private readonly materialRepository: Repository<MaterialMaster>,
        @InjectRepository(WarehouseMaster)
        private readonly warehouseRepository: Repository<WarehouseMaster>,
        private readonly dataSource: DataSource,
    ) { }

    /**
     * รับเข้าวัสดุ (Goods Receipt - IN)
     * บันทึกการรับเข้าวัสดุพร้อมอัพเดทยอดคงคลัง
     */
    async goodsReceipt(dto: GoodsReceiptDto): Promise<InventoryTransaction> {
        return await this.executeTransaction(async (queryRunner) => {
            // Validate material and warehouse
            const [material, warehouse] = await this.validateMaterialAndWarehouse(
                dto.material_id,
                dto.warehouse_id,
                queryRunner,
            );

            // Get or create inventory record
            let inventory = await this.getOrCreateInventory(
                material,
                warehouse,
                queryRunner,
            );

            // Update inventory quantity (increase)
            inventory.quantity += dto.quantity;

            // Update dates if provided
            if (dto.mfg_date) inventory.mfg_date = dto.mfg_date;
            if (dto.exp_date) inventory.exp_date = dto.exp_date;
            if (dto.order_number) inventory.order_number = dto.order_number;

            await queryRunner.manager.save(inventory);
            const transaction = queryRunner.manager.create(InventoryTransaction, {
                materialInventory: inventory,
                warehouse,
                transaction_type: TransactionType.IN,
                transaction_date: new Date(),
                quantity_change: dto.quantity,
                reference_number: dto.reference_number || this.generateReferenceNumber('GR'),
                reason_remarks: dto.reason_remarks || 'Goods Receipt',
            });

            return await queryRunner.manager.save(transaction);
        });
    }

    /**
     * เบิก/จ่ายวัสดุ (Goods Issue - OUT)
     * บันทึกการเบิกวัสดุพร้อมตรวจสอบยอดคงคลัง
     */
    async goodsIssue(dto: GoodsIssueDto): Promise<InventoryTransaction> {
        return await this.executeTransaction(async (queryRunner) => {
            // Validate material and warehouse
            const [material, warehouse] = await this.validateMaterialAndWarehouse(
                dto.material_id,
                dto.warehouse_id,
                queryRunner,
            );

            // Get inventory record
            const inventory = await this.getInventoryOrThrow(
                dto.material_id,
                dto.warehouse_id,
                queryRunner,
            );

            // Check stock availability
            if (inventory.quantity < dto.quantity) {
                throw new BadRequestException(
                    `Insufficient stock. Available: ${inventory.quantity}, Requested: ${dto.quantity}`
                );
            }

            // Update inventory quantity (decrease)
            inventory.quantity -= dto.quantity;
            await queryRunner.manager.save(inventory);

            // Create transaction record
            const transaction = queryRunner.manager.create(InventoryTransaction, {
                materialInventory: inventory,
                warehouse,
                transaction_type: TransactionType.OUT,
                transaction_date: new Date(),
                quantity_change: -dto.quantity,
                reference_number: dto.reference_number,
                reason_remarks: dto.reason_remarks || 'Goods Issue',
            });

            return await queryRunner.manager.save(transaction);
        });
    }

    /**
     * โอนย้ายระหว่างโกดัง (Warehouse Transfer)
     * สร้างรายการคู่ (Transaction OUT และ IN)
     */
    async warehouseTransfer(dto: WarehouseTransferDto): Promise<TransferResultDto> {
        this.validateTransferWarehouses(dto.source_warehouse_id, dto.target_warehouse_id);

        return await this.executeTransaction(async (queryRunner) => {
            const { material, sourceWarehouse, targetWarehouse, sourceInventory } =
                await this.prepareTransferData(dto, queryRunner);

            this.validateStockAvailability(sourceInventory.quantity, dto.quantity, 'source warehouse');

            const targetInventory = await this.getOrCreateInventory(
                material,
                targetWarehouse,
                queryRunner,
                this.extractInventoryMetadata(sourceInventory),
            );

            const referenceNumber = dto.reference_number || this.generateReferenceNumber('TR');

            const [savedTransferOut, savedTransferIn] = await Promise.all([
                this.processTransferOut(queryRunner, sourceInventory, sourceWarehouse, dto, referenceNumber, targetWarehouse.warehouse_name),
                this.processTransferIn(queryRunner, targetInventory, targetWarehouse, dto, referenceNumber, sourceWarehouse.warehouse_name),
            ]);

            return this.buildTransferResult(savedTransferOut.id, savedTransferIn.id, dto);
        });
    }

    /**
     * ปรับปรุงยอดคงคลัง (Inventory Adjustment)
     * ใช้สำหรับแก้ไขยอดที่ไม่ถูกต้อง (เช่น จากการตรวจนับ)
     */
    async inventoryAdjustment(dto: InventoryAdjustmentDto): Promise<InventoryTransaction> {
        return await this.executeTransaction(async (queryRunner) => {
            const [, warehouse] = await this.validateMaterialAndWarehouse(
                dto.material_id,
                dto.warehouse_id,
                queryRunner,
            );

            const inventory = await this.getInventoryOrThrow(dto.material_id, dto.warehouse_id, queryRunner);
            const transactionType = this.determineAdjustmentType(dto.quantity_change);

            this.validateAdjustmentQuantity(inventory.quantity, dto.quantity_change);

            await this.updateInventoryQuantity(queryRunner, inventory, dto.quantity_change);

            return this.createAndSaveTransaction(queryRunner, {
                inventory,
                warehouse,
                transactionType,
                quantityChange: dto.quantity_change,
                referenceNumber: dto.reference_number || this.generateReferenceNumber('ADJ'),
                remarks: dto.reason_remarks,
            });
        });
    }

    // ============ Private Helper Methods ============

    /**
     * Execute operations within a database transaction
     */
    private async executeTransaction<T>(
        operation: (queryRunner: QueryRunner) => Promise<T>,
    ): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await operation(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // ============ Validation Helpers ============

    private validateTransferWarehouses(sourceId: number, destinationId: number): void {
        if (sourceId === destinationId) {
            throw new BadRequestException('Source and destination warehouse cannot be the same');
        }
    }

    private validateStockAvailability(available: number, requested: number, location: string = ''): void {
        if (available < requested) {
            const locationText = location ? ` in ${location}` : '';
            throw new BadRequestException(
                `Insufficient stock${locationText}. Available: ${available}, Requested: ${requested}`
            );
        }
    }

    private validateAdjustmentQuantity(currentQty: number, adjustment: number): void {
        if (adjustment < 0 && currentQty + adjustment < 0) {
            throw new BadRequestException(
                `Cannot adjust below zero. Current: ${currentQty}, Adjustment: ${adjustment}`
            );
        }
    }

    private async validateMaterialAndWarehouse(
        materialId: number,
        warehouseId: number,
        queryRunner: QueryRunner,
    ): Promise<[MaterialMaster, WarehouseMaster]> {
        const material = await queryRunner.manager.findOne(MaterialMaster, {
            where: { material_id: materialId },
        });

        if (!material) {
            throw new NotFoundException(`Material with ID ${materialId} not found`);
        }

        if (!material.is_active) {
            throw new BadRequestException(`Material with ID ${materialId} is not active`);
        }

        const warehouse = await this.validateWarehouse(warehouseId, queryRunner);

        return [material, warehouse];
    }

    private async validateWarehouse(
        warehouseId: number,
        queryRunner: QueryRunner,
    ): Promise<WarehouseMaster> {
        const warehouse = await queryRunner.manager.findOne(WarehouseMaster, {
            where: { id: warehouseId },
        });

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
        }

        if (!warehouse.is_active) {
            throw new BadRequestException(`Warehouse with ID ${warehouseId} is not active`);
        }

        return warehouse;
    }

    // ============ Inventory Helpers ============

    private async getInventoryOrThrow(
        materialId: number,
        warehouseId: number,
        queryRunner: QueryRunner,
    ): Promise<MaterialInventory> {
        const inventory = await queryRunner.manager.findOne(MaterialInventory, {
            where: {
                material: { material_id: materialId },
                warehouse: { id: warehouseId },
            },
            relations: ['material', 'warehouse'],
        });

        if (!inventory) {
            throw new NotFoundException(
                `No inventory record found for material ID ${materialId} in warehouse ID ${warehouseId}`
            );
        }

        return inventory;
    }

    private async getOrCreateInventory(
        material: MaterialMaster,
        warehouse: WarehouseMaster,
        queryRunner: QueryRunner,
        additionalData?: Partial<MaterialInventory>,
    ): Promise<MaterialInventory> {
        let inventory = await queryRunner.manager.findOne(MaterialInventory, {
            where: {
                material: { material_id: material.material_id },
                warehouse: { id: warehouse.id },
            },
            relations: ['material', 'warehouse'],
        });

        if (!inventory) {
            inventory = queryRunner.manager.create(MaterialInventory, {
                material,
                warehouse,
                quantity: 0,
                ...additionalData,
            });
            inventory = await queryRunner.manager.save(inventory);
        }

        return inventory;
    }

    private async updateInventoryQuantity(
        queryRunner: QueryRunner,
        inventory: MaterialInventory,
        quantityChange: number,
    ): Promise<MaterialInventory> {
        inventory.quantity += quantityChange;
        return queryRunner.manager.save(inventory);
    }

    private extractInventoryMetadata(inventory: MaterialInventory): Partial<MaterialInventory> {
        return {
            mfg_date: inventory.mfg_date,
            exp_date: inventory.exp_date,
            order_number: inventory.order_number,
        };
    }

    // ============ Transfer Helpers ============

    private async prepareTransferData(dto: WarehouseTransferDto, queryRunner: QueryRunner) {
        const [material, sourceWarehouse] = await this.validateMaterialAndWarehouse(
            dto.material_id,
            dto.source_warehouse_id,
            queryRunner,
        );

        const targetWarehouse = await this.validateWarehouse(dto.target_warehouse_id, queryRunner);
        const sourceInventory = await this.getInventoryOrThrow(dto.material_id, dto.source_warehouse_id, queryRunner);

        return { material, sourceWarehouse, targetWarehouse, sourceInventory };
    }

    private async processTransferOut(
        queryRunner: QueryRunner,
        inventory: MaterialInventory,
        warehouse: WarehouseMaster,
        dto: WarehouseTransferDto,
        referenceNumber: string,
        targetName: string,
    ): Promise<InventoryTransaction> {
        await this.updateInventoryQuantity(queryRunner, inventory, -dto.quantity);

        return this.createAndSaveTransaction(queryRunner, {
            inventory,
            warehouse,
            transactionType: TransactionType.TRANSFER_OUT,
            quantityChange: -dto.quantity,
            referenceNumber,
            remarks: dto.reason_remarks || `Transfer to ${targetName}`,
        });
    }

    private async processTransferIn(
        queryRunner: QueryRunner,
        inventory: MaterialInventory,
        warehouse: WarehouseMaster,
        dto: WarehouseTransferDto,
        referenceNumber: string,
        sourceName: string,
    ): Promise<InventoryTransaction> {
        await this.updateInventoryQuantity(queryRunner, inventory, dto.quantity);

        return this.createAndSaveTransaction(queryRunner, {
            inventory,
            warehouse,
            transactionType: TransactionType.TRANSFER_IN,
            quantityChange: dto.quantity,
            referenceNumber,
            remarks: dto.reason_remarks || `Transfer from ${sourceName}`,
        });
    }

    private buildTransferResult(
        outId: number,
        inId: number,
        dto: WarehouseTransferDto,
    ): TransferResultDto {
        return {
            transfer_out_transaction_id: outId,
            transfer_in_transaction_id: inId,
            material_id: dto.material_id,
            source_warehouse_id: dto.source_warehouse_id,
            target_warehouse_id: dto.target_warehouse_id,
            quantity: dto.quantity,
            message: 'Transfer completed successfully',
        };
    }

    // ============ Transaction Helpers ============

    private determineAdjustmentType(quantityChange: number): TransactionType {
        return quantityChange > 0 ? TransactionType.ADJUSTMENT_IN : TransactionType.ADJUSTMENT_OUT;
    }

    private async createAndSaveTransaction(
        queryRunner: QueryRunner,
        params: {
            inventory: MaterialInventory;
            warehouse: WarehouseMaster;
            transactionType: TransactionType;
            quantityChange: number;
            referenceNumber: string;
            remarks?: string;
        },
    ): Promise<InventoryTransaction> {
        const transaction = queryRunner.manager.create(InventoryTransaction, {
            materialInventory: params.inventory,
            warehouse: params.warehouse,
            transaction_type: params.transactionType,
            transaction_date: new Date(),
            quantity_change: params.quantityChange,
            reference_number: params.referenceNumber,
            reason_remarks: params.remarks,
        });

        return queryRunner.manager.save(transaction);
    }

    private generateReferenceNumber(prefix: string): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}
