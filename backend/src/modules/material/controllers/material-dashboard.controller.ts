import { Controller, Get, Query } from '@nestjs/common';
import { DashboardMaterialService } from '../services/dashboard-material.service';

@Controller({
    path: 'materials/dashboard',
    version: '1',
})
export class MaterialDashboardController {
    constructor(private readonly dashboardService: DashboardMaterialService) { }

    @Get('stats')
    async getStats() {
        const data = await this.dashboardService.getMaterialStats();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('value-distribution')
    async getValueDistribution() {
        const data = await this.dashboardService.getValueDistribution();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('movement-trends')
    async getMovementTrends(@Query('range') range: '7d' | '30d' | '1y' = '7d') {
        const data = await this.dashboardService.getMovementTrends(range);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }
}
