import { Injectable } from '@nestjs/common';
import { DashboardUserService } from '../../user/services/dashboard-user.service';
import { DashboardMaterialService } from '../../material/services/dashboard-material.service';
import { DashboardPlanService } from '../../product-plan/services/dash-board.service';
import { DashboardInventoryService } from '../../material-inventory/services/dashboard-inventory.service';

@Injectable()
export class MainDashboardService {
    constructor(
        private readonly userService: DashboardUserService,
        private readonly materialService: DashboardMaterialService,
        private readonly planService: DashboardPlanService,
        private readonly inventoryService: DashboardInventoryService,
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
}
