import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseMaster } from '../entities/warehouse-master.entity';
import { MaterialInventory } from '../../material-inventory/entities/material-inventory.entity';

@Injectable()
export class DashboardWarehouseService {
    constructor(
        @InjectRepository(WarehouseMaster)
        private readonly warehouseRepository: Repository<WarehouseMaster>,
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepository: Repository<MaterialInventory>,
    ) { }

    async getStatsSummary() {
        const totalWarehouses = await this.warehouseRepository.count();
        const activeWarehouses = await this.warehouseRepository.count({ where: { is_active: true } });

        // Calculate Total Inventory Value and Stock Items
        const { totalInventoryValue, totalStockItems } = await this.getInventoryTotals();

        // Calculate Low Stock Alerts
        const lowStockAlerts = await this.getLowStockAlertsCount();

        // Utilization Rate (Mocked as no capacity field exists in WarehouseMaster)
        // Ideally: sum(inventory volume) / sum(warehouse capacity)
        const utilizationRate = 78;

        return {
            total_warehouses: totalWarehouses,
            active_warehouses: activeWarehouses,
            total_inventory_value: totalInventoryValue,
            total_stock_items: totalStockItems,
            low_stock_alerts: lowStockAlerts,
            utilization_rate: utilizationRate
        };
    }

    async getStockDistribution() {
        // Group by Warehouse and calculate Value & Item Count
        const result = await this.inventoryRepository.createQueryBuilder('inv')
            .leftJoinAndSelect('inv.warehouse', 'warehouse')
            .leftJoinAndSelect('inv.material', 'material')
            .select('warehouse.warehouse_name', 'warehouse_name')
            .addSelect('SUM(inv.quantity)', 'item_count')
            .addSelect('SUM(inv.quantity * COALESCE(material.cost_per_unit, 0))', 'value')
            .groupBy('warehouse.warehouse_name')
            .getRawMany();

        return result.map(item => ({
            warehouse_name: item.warehouse_name || 'Unknown',
            value: Number(item.value),
            item_count: Number(item.item_count)
        }));
    }

    async getUtilization() {
        // Returns mocked capacity data as schema doesn't support it yet
        // If we want to be dynamic, we could fetch all active warehouses and mock 'capacity' for them.
        const warehouses = await this.warehouseRepository.find({ where: { is_active: true } });

        return warehouses.map(wh => {
            // Pseudo-random but consistent logic for demo
            const capacity = 10000;
            const used = Math.floor(Math.random() * 8000) + 1000; // Mock using random for now as we don't track volume
            return {
                warehouse_name: wh.warehouse_name,
                capacity: capacity,
                used: used,
                percentage: Math.floor((used / capacity) * 100)
            };
        });
    }

    private async getInventoryTotals() {
        const result = await this.inventoryRepository.createQueryBuilder('inv')
            .leftJoin('inv.material', 'material')
            .select('SUM(inv.quantity)', 'totalQuantity')
            .addSelect('SUM(inv.quantity * COALESCE(material.cost_per_unit, 0))', 'totalValue')
            .getRawOne();

        return {
            totalInventoryValue: Number(result.totalValue) || 0,
            totalStockItems: Number(result.totalQuantity) || 0
        };
    }

    private async getLowStockAlertsCount() {
        // Logic: Count inventory items where quantity < (container_min_stock * quantity_per_container)
        // We need to fetch inventory with material info

        const inventoryItems = await this.inventoryRepository.find({
            relations: ['material']
        });

        let alerts = 0;
        for (const item of inventoryItems) {
            if (item.material) {
                const minContainer = item.material.container_min_stock || 0;
                const qtyPerContainer = item.material.quantity_per_container || 1;
                const minThreshold = minContainer * qtyPerContainer;

                if (minThreshold > 0 && item.quantity < minThreshold) {
                    alerts++;
                }
            }
        }
        return alerts;
    }
}
