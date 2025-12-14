import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialInventory } from '../../material-inventory/entities/material-inventory.entity';
import { InventoryTransaction } from '../../inventory-transaction/entities/inventory-transaction.entity';
import { Repository, Between } from 'typeorm';

@Injectable()
export class DashboardInventoryProvider {
    constructor(
        @InjectRepository(MaterialInventory)
        private inventoryRepository: Repository<MaterialInventory>,
        @InjectRepository(InventoryTransaction)
        private transactionRepository: Repository<InventoryTransaction>,
    ) { }

    async getInventoryStats() {
        const inventoryItems = await this.inventoryRepository.find({
            relations: ['material'],
        });
        let totalValue = 0;
        inventoryItems.forEach((inv) => {
            if (inv.material && inv.material.cost_per_unit) {
                totalValue += inv.quantity * inv.material.cost_per_unit;
            }
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const transactions = await this.transactionRepository.find({
            where: {
                transaction_date: Between(todayStart, todayEnd),
            },
        });

        let inboundToday = 0;
        let outboundToday = 0;
        transactions.forEach((t) => {
            if (t.quantity_change > 0) inboundToday += t.quantity_change;
            else outboundToday += Math.abs(t.quantity_change);
        });

        return {
            totalValue,
            currency: 'THB',
            inboundToday,
            outboundToday,
            movements: transactions.length,
        };
    }
}
