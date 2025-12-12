import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { MaterialInventory } from 'src/modules/material-inventory/entities/material-inventory.entity';

/**
 * Interface สำหรับ Stock Operation
 * Open/Closed Principle: สามารถขยายได้โดยไม่ต้องแก้ไข
 */
export interface IStockOperation {
    inventory_id: number;
    quantity: number;
}

/**
 * Service สำหรับจัดการ Stock Reservation
 * 
 * Single Responsibility: จัดการเฉพาะ stock operations (reserve, deduct, return)
 * Dependency Inversion: ใช้ Repository interface
 */
@Injectable()
export class StockReservationService {
    constructor(
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepository: Repository<MaterialInventory>,
        private readonly dataSource: DataSource,
    ) { }

    /**
     * ตรวจสอบว่า stock พร้อมใช้งาน (quantity - reserved_quantity >= required)
     */
    async checkAvailableStock(inventoryId: number, requiredQuantity: number): Promise<{
        available: boolean;
        currentQuantity: number;
        reservedQuantity: number;
        availableQuantity: number;
    }> {
        const inventory = await this.inventoryRepository.findOne({
            where: { id: inventoryId },
        });

        if (!inventory) {
            throw new BadRequestException(`Inventory with ID ${inventoryId} not found`);
        }

        const availableQuantity = inventory.quantity - inventory.reserved_quantity;

        return {
            available: availableQuantity >= requiredQuantity,
            currentQuantity: inventory.quantity,
            reservedQuantity: inventory.reserved_quantity,
            availableQuantity,
        };
    }

    /**
     * จอง Stock (เพิ่ม reserved_quantity)
     * ใช้ตอน Confirm Plan
     */
    async reserveStock(operations: IStockOperation[], queryRunner?: QueryRunner): Promise<void> {
        const runner = queryRunner || this.dataSource.createQueryRunner();
        const shouldManageTransaction = !queryRunner;

        if (shouldManageTransaction) {
            await runner.connect();
            await runner.startTransaction();
        }

        try {
            for (const op of operations) {
                const inventory = await runner.manager.findOne(MaterialInventory, {
                    where: { id: op.inventory_id },
                    lock: { mode: 'pessimistic_write' }, // Lock row to prevent race condition
                });

                if (!inventory) {
                    throw new BadRequestException(`Inventory with ID ${op.inventory_id} not found`);
                }

                const availableQuantity = inventory.quantity - inventory.reserved_quantity;
                if (availableQuantity < op.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for inventory ${op.inventory_id}. ` +
                        `Available: ${availableQuantity}, Required: ${op.quantity}`
                    );
                }

                inventory.reserved_quantity = Math.round(inventory.reserved_quantity + op.quantity);
                await runner.manager.save(inventory);
            }

            if (shouldManageTransaction) {
                await runner.commitTransaction();
            }
        } catch (error) {
            if (shouldManageTransaction) {
                await runner.rollbackTransaction();
            }
            throw error;
        } finally {
            if (shouldManageTransaction) {
                await runner.release();
            }
        }
    }

    /**
     * ตัด Stock จริง (ลด quantity และ reserved_quantity)
     * ใช้ตอน Start Production
     */
    async deductStock(operations: IStockOperation[], queryRunner?: QueryRunner): Promise<void> {
        const runner = queryRunner || this.dataSource.createQueryRunner();
        const shouldManageTransaction = !queryRunner;

        if (shouldManageTransaction) {
            await runner.connect();
            await runner.startTransaction();
        }

        try {
            console.log(`[deductStock] Operations count: ${operations.length}`);
            console.log(`[deductStock] Operations:`, operations);

            for (const op of operations) {
                const inventory = await runner.manager.findOne(MaterialInventory, {
                    where: { id: op.inventory_id },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!inventory) {
                    throw new BadRequestException(`Inventory with ID ${op.inventory_id} not found`);
                }

                console.log(`[deductStock] BEFORE - inventory ${op.inventory_id}: qty=${inventory.quantity}, reserved=${inventory.reserved_quantity}`);
                console.log(`[deductStock] Deducting: ${op.quantity}`);

                // ป้องกัน quantity ติดลบ
                if (inventory.quantity < op.quantity) {
                    throw new BadRequestException(
                        `Insufficient quantity for inventory ${op.inventory_id}. ` +
                        `Available: ${inventory.quantity}, Required: ${op.quantity}`
                    );
                }

                inventory.quantity = Math.round(inventory.quantity - op.quantity);
                // ป้องกัน reserved_quantity ติดลบ
                inventory.reserved_quantity = Math.round(Math.max(0, inventory.reserved_quantity - op.quantity));

                console.log(`[deductStock] AFTER - inventory ${op.inventory_id}: qty=${inventory.quantity}, reserved=${inventory.reserved_quantity}`);

                await runner.manager.save(inventory);
            }

            if (shouldManageTransaction) {
                await runner.commitTransaction();
            }
        } catch (error) {
            if (shouldManageTransaction) {
                await runner.rollbackTransaction();
            }
            throw error;
        } finally {
            if (shouldManageTransaction) {
                await runner.release();
            }
        }
    }

    /**
     * คืน Stock (เพิ่ม quantity กลับ)
     * ใช้ตอน Cancel/Complete ที่มีวัสดุเหลือ
     */
    async returnStock(operations: IStockOperation[], queryRunner?: QueryRunner): Promise<void> {
        const runner = queryRunner || this.dataSource.createQueryRunner();
        const shouldManageTransaction = !queryRunner;

        if (shouldManageTransaction) {
            await runner.connect();
            await runner.startTransaction();
        }

        try {
            for (const op of operations) {
                const inventory = await runner.manager.findOne(MaterialInventory, {
                    where: { id: op.inventory_id },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!inventory) {
                    throw new BadRequestException(`Inventory with ID ${op.inventory_id} not found`);
                }

                // ใช้ Math.round เพราะ quantity เป็น INT ใน DB
                inventory.quantity = Math.round(inventory.quantity + op.quantity);
                await runner.manager.save(inventory);
            }

            if (shouldManageTransaction) {
                await runner.commitTransaction();
            }
        } catch (error) {
            if (shouldManageTransaction) {
                await runner.rollbackTransaction();
            }
            throw error;
        } finally {
            if (shouldManageTransaction) {
                await runner.release();
            }
        }
    }

    /**
     * ยกเลิกการจอง Stock (ลด reserved_quantity)
     * ใช้ตอน Cancel จาก PENDING status
     */
    async releaseReservation(operations: IStockOperation[], queryRunner?: QueryRunner): Promise<void> {
        const runner = queryRunner || this.dataSource.createQueryRunner();
        const shouldManageTransaction = !queryRunner;

        if (shouldManageTransaction) {
            await runner.connect();
            await runner.startTransaction();
        }

        try {
            for (const op of operations) {
                const inventory = await runner.manager.findOne(MaterialInventory, {
                    where: { id: op.inventory_id },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!inventory) {
                    throw new BadRequestException(`Inventory with ID ${op.inventory_id} not found`);
                }

                inventory.reserved_quantity = Math.round(Math.max(0, inventory.reserved_quantity - op.quantity));
                await runner.manager.save(inventory);
            }

            if (shouldManageTransaction) {
                await runner.commitTransaction();
            }
        } catch (error) {
            if (shouldManageTransaction) {
                await runner.rollbackTransaction();
            }
            throw error;
        } finally {
            if (shouldManageTransaction) {
                await runner.release();
            }
        }
    }
}
