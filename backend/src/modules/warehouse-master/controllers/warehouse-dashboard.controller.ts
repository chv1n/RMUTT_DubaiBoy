import { Controller, Get } from '@nestjs/common';
import { DashboardWarehouseService } from '../services/dashboard-warehouse.service';

@Controller({
    path: 'warehouse/dashboard',
    version: '1',
})
export class WarehouseDashboardController {
    constructor(private readonly dashboardService: DashboardWarehouseService) { }

    @Get('stats')
    async getStats() {
        const data = await this.dashboardService.getStatsSummary();
        return {
            success: true,
            data,
        };
    }

    @Get('distribution')
    async getDistribution() {
        const data = await this.dashboardService.getStockDistribution();
        return {
            success: true,
            data,
        };
    }

    @Get('utilization')
    async getUtilization() {
        const data = await this.dashboardService.getUtilization();
        return {
            success: true,
            data,
        };
    }
}
