import { Controller, Get, Query } from '@nestjs/common';
import { DashboardInventoryService } from '../services/dashboard-inventory.service';

@Controller({
    path: 'inventory/dashboard',
    version: '1',
})
export class InventoryDashboardController {
    constructor(private readonly dashboardService: DashboardInventoryService) { }

    @Get('stats')
    async getStats() {
        const data = await this.dashboardService.getInventoryStats();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('value-trends')
    async getValueTrends(@Query('range') range: string) {
        const data = await this.dashboardService.getValueTrends(range);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('movement')
    async getMovement(@Query('range') range: string) {
        const data = await this.dashboardService.getMovements(range);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }
}
