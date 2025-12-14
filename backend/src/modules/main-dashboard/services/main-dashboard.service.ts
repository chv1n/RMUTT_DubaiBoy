import { Injectable } from '@nestjs/common';
import { DashboardUserService } from '../../user/services/dashboard-user.service';
import { DashboardMaterialService } from '../../material/services/dashboard-material.service';
import { DashboardPlanService } from '../../product-plan/services/dash-board.service';
import { DashboardInventoryService } from '../../material-inventory/services/dashboard-inventory.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialInventory } from 'src/modules/material-inventory/entities/material-inventory.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class MainDashboardService {
    constructor(
        private readonly userService: DashboardUserService,
        private readonly materialService: DashboardMaterialService,
        private readonly planService: DashboardPlanService,
        private readonly inventoryService: DashboardInventoryService,
        @InjectRepository(MaterialInventory) private readonly materialInventoryRepository: Repository<MaterialInventory>,
    ) { }

    async getOverview(range: string) {

        const [userStats, materialStats, planStats, inventoryStats, performanceStats] = await Promise.all([
            this.userService.getStats('6months'),
            this.materialService.getMaterialStats(),
            this.planService.getPlanStats(),
            this.inventoryService.getInventoryStats(),
            this.inventoryService.getPerformanceStats(),
        ]);

        const users = {
            total: userStats.totalUsers,
            active: userStats.activeUsers,
            inactive: userStats.inactiveUsers,
            change: userStats.change || 0,
            trend: userStats.trend || 'stable'
        };

        const materials = {
            total: materialStats.total_materials_count,
            lowStock: materialStats.low_stock_count,
            outOfStock: materialStats.out_of_stock_count,
            active: materialStats.active_materials_count,
            change: materialStats.trends?.material_count_change || 0,
            changeTrend: (materialStats.trends?.material_count_change || 0) >= 0 ? 'up' : 'down'
        };

        const plans = {
            active: planStats.active_plans,
            completed: planStats.completed_plans,
            totalTarget: planStats.total_production_target,
            onTimeRate: planStats.on_time_rate,
            trend: planStats.trend?.active_plans?.includes('-') ? 'down' : 'up'
        };

        const inventory = {
            totalValue: inventoryStats.total_inventory_value,
            currency: 'THB',
            inboundToday: inventoryStats.movement_in_today,
            outboundToday: inventoryStats.movement_out_today,
            movements: inventoryStats.movement_in_today + inventoryStats.movement_out_today
        };

        // Aggregating Alerts Dynamically
        const alerts: { id: number; type: string; message: string; timestamp: string; link: string }[] = [];



        if (materialStats.low_stock_count > 0) {
            alerts.push({
                id: 1,
                type: "warning",
                message: `Low stock items: ${materialStats.low_stock_count}`,
                timestamp: new Date().toISOString(),
                link: "/materials/dashboard"
            });
        }
        if (planStats.on_time_rate < 80) {
            alerts.push({
                id: 2,
                type: "critical",
                message: `On-time rate dropped to ${planStats.on_time_rate}%`,
                timestamp: new Date().toISOString(),
                link: "/product-plans"
            });
        }
        if (inventoryStats.out_of_stock_items > 0) {
            alerts.push({
                id: 3,
                type: "critical",
                message: `Out of stock items: ${inventoryStats.out_of_stock_items}`,
                timestamp: new Date().toISOString(),
                link: "/inventory/balance"
            });
        }


        const systemPerformance = performanceStats;

        return {
            users,
            materials,
            plans,
            inventory,
            alerts,
            systemPerformance
        };
    }


    async getSmartStats() {
        const [materialStats, planStats, inventoryStats] = await Promise.all([
            this.materialService.getMaterialStats(),
            this.planService.getPlanStats(),
            this.inventoryService.getInventoryStats(),
        ]);

        return {
            total_materials: materialStats.total_materials_count,
            low_stock_materials: materialStats.low_stock_count,
            critical_alerts: materialStats.critical_alerts || 0,
            total_stock_value: inventoryStats.total_inventory_value,
            active_production_plans: planStats.active_plans
        };
    }

    async getLowStock(limit: number) {
        return this.materialService.getLowStockMaterials(limit);
    }

    async getSmartAlerts() {
        const [lowStock, expiring, plansAtRisk] = await Promise.all([
            this.materialService.getLowStockMaterials(50),
            this.inventoryService.getExpiringItems(7),
            this.planService.getPlansAtRisk()
        ]);

        const alerts: any[] = [];
        let idCounter = 1;

        // Map Shortage
        lowStock.forEach(item => {
            alerts.push({
                id: idCounter++,
                type: 'SHORTAGE',
                severity: item.status === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
                message: `${item.material_name} – Shortage ${item.shortage_qty} ${item.unit}`,
                details: `Reorder immediately. Current: ${item.current_qty}`,
                timestamp: new Date().toISOString()
            });
        });

        // Map Expiry
        expiring.forEach(item => {
            alerts.push({
                id: idCounter++,
                type: 'EXPIRY',
                severity: 'MEDIUM',
                message: `${item.material_name} – Expire in < 7 days`,
                details: `Qty: ${item.qty}, Date: ${new Date(item.exp_date).toLocaleDateString()}`,
                timestamp: new Date().toISOString()
            });
        });

        // Map Plan Risk
        plansAtRisk.forEach(plan => {
            const blocked = plan.risk_materials.filter(r => r.status === 'BLOCKED').length;
            alerts.push({
                id: idCounter++,
                type: 'PLAN_RISK',
                severity: plan.overall_status === 'BLOCKED' ? 'HIGH' : 'MEDIUM',
                message: `${plan.plan_name} – Material not enough`,
                details: `Missing ${plan.risk_materials.length} items (${blocked} blocked)`,
                timestamp: new Date().toISOString()
            });
        });

        // Sort by Severity (HIGH > MEDIUM > LOW)
        const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

        return alerts;
    }

    async getSmartCharts(type: string, range: string) {
        if (type === 'stock_trend') {
            const data = await this.inventoryService.getValueTrends(range);
            return {
                title: `Stock Value Trend (Last ${range})`,
                label: 'Total Value (THB)',
                datasets: data
            };
        } else if (type === 'top_consumption') {
            return this.inventoryService.getTopConsumption(range);
        } else if (type === 'inventory_turnover') {
            // Not fully implemented trend, returning stats
            const stats = await this.materialService.getMaterialStats();
            return {
                turnover_rate: stats.turnover_rate,
                trend: stats.trends.turnover_change
            };
        }
        return [];
    }

    async getPlansAtRisk() {
        return this.planService.getPlansAtRisk();
    }
}
