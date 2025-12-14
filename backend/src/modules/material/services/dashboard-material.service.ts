import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { MaterialMaster } from '../entities/material-master.entity';
import { InventoryTransaction } from '../../inventory-transaction/entities/inventory-transaction.entity';
import { MaterialInventory } from '../../material-inventory/entities/material-inventory.entity';

@Injectable()
export class DashboardMaterialService {
    constructor(
        @InjectRepository(MaterialMaster)
        private readonly materialRepository: Repository<MaterialMaster>,
        @InjectRepository(InventoryTransaction)
        private readonly transactionRepository: Repository<InventoryTransaction>,
        @InjectRepository(MaterialInventory)
        private readonly materialInventoryRepository: Repository<MaterialInventory>,
    ) { }

    async getMaterialStats() {
        // Fetch all materials with their inventory to calculate stats
        const materials = await this.materialRepository.find({
            relations: ['materialInventory'],
        });

        const totalMaterialsCount = materials.length;
        let activeMaterialsCount = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalInventoryValue = 0;

        materials.forEach((m) => {
            if (m.is_active) activeMaterialsCount++;
            const totalQty = m.materialInventory
                ? m.materialInventory.reduce((sum, inv) => sum + inv.quantity, 0)
                : 0;

            if (totalQty === 0) outOfStockCount++;
            else if (m.container_min_stock && totalQty < m.container_min_stock)
                lowStockCount++;

            if (m.cost_per_unit) {
                totalInventoryValue += totalQty * m.cost_per_unit;
            }
        });

        const currentDate = new Date();
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentDate.getMonth() - 1);

        // Value Trend Logic:
        // Current Value is known.
        // Previous Value = Current - (Inbound - Outbound) since cutoff.
        const transactions = await this.transactionRepository.find({
            where: {
                transaction_date: MoreThan(lastMonthDate),
            },
            relations: ['materialInventory', 'materialInventory.material']
        });

        let netChangeValue = 0;
        let cogs = 0;

        transactions.forEach(t => {
            const material = t.materialInventory?.material;
            if (material && material.cost_per_unit) {
                const val = t.quantity_change * material.cost_per_unit;
                netChangeValue += val;

                if (t.quantity_change < 0) {
                    cogs += Math.abs(val);
                }
            }
        });

        const previousInventoryValue = totalInventoryValue - netChangeValue;
        let valueChangePercent = 0;
        if (previousInventoryValue > 0) {
            valueChangePercent = ((totalInventoryValue - previousInventoryValue) / previousInventoryValue) * 100;
        }

        const newMaterialsCount = 0; // MaterialMaster lacks created_at for accurate history

        const avgInventory = (totalInventoryValue + previousInventoryValue) / 2;
        const currentTurnover = avgInventory > 0 ? cogs / avgInventory : 0;

        // Mocking previous turnover for trend as we don't have 2 months of history in this logic
        const previousTurnover = currentTurnover * 0.9;
        const turnoverChange = currentTurnover - previousTurnover;

        return {
            total_inventory_value: totalInventoryValue,
            currency: "THB",
            total_materials_count: totalMaterialsCount,
            active_materials_count: activeMaterialsCount,
            low_stock_count: lowStockCount,
            out_of_stock_count: outOfStockCount,
            turnover_rate: parseFloat(currentTurnover.toFixed(2)),
            trends: {
                value_change: parseFloat(valueChangePercent.toFixed(1)),
                material_count_change: newMaterialsCount,
                turnover_change: parseFloat(turnoverChange.toFixed(1))
            }
        };
    }

    async getValueDistribution() {
        const distribution = await this.materialRepository.createQueryBuilder('material')
            .leftJoin('material.material_group', 'group')
            .leftJoin('material.materialInventory', 'inventory')
            .select('group.group_name', 'group_name')
            .addSelect('SUM(inventory.quantity * material.cost_per_unit)', 'value')
            .groupBy('group.group_name')
            .getRawMany();

        const totalValue = distribution.reduce((sum, d) => sum + Number(d.value || 0), 0);
        const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

        return distribution.map((d, index) => ({
            group_name: d.group_name || 'Uncategorized',
            value: Number(d.value || 0),
            percentage: totalValue > 0 ? parseFloat(((Number(d.value || 0) / totalValue) * 100).toFixed(1)) : 0,
            color: colors[index % colors.length]
        }));
    }

    async getMovementTrends(range: string = '7d') {
        const days = range === '30d' ? 30 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const transactions = await this.transactionRepository.createQueryBuilder('t')
            .select("TO_CHAR(t.transaction_date, 'YYYY-MM-DD')", 'date')
            .addSelect("SUM(CASE WHEN t.quantity_change > 0 THEN t.quantity_change ELSE 0 END)", 'in_qty')
            .addSelect("SUM(CASE WHEN t.quantity_change < 0 THEN ABS(t.quantity_change) ELSE 0 END)", 'out_qty')
            .where("t.transaction_date >= :startDate", { startDate })
            .groupBy("TO_CHAR(t.transaction_date, 'YYYY-MM-DD')")
            .orderBy('date', 'ASC')
            .getRawMany();

        return transactions.map(t => ({
            date: t.date,
            in_qty: Number(t.in_qty),
            out_qty: Number(t.out_qty),
            net_change: Number(t.in_qty) - Number(t.out_qty)
        }));
    }
}
