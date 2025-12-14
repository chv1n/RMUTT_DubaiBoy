import { Controller, Get, Query } from '@nestjs/common';
import { MainDashboardService } from '../services/main-dashboard.service';

@Controller({
    path: 'dashboard',
    version: '1',
})
export class MainDashboardController {
    constructor(private readonly mainDashboardService: MainDashboardService) { }

    @Get('overview')
    async getOverview(@Query('range') range: string = 'month') {
        const data = await this.mainDashboardService.getOverview(range);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('smart/stats')
    async getSmartStats() {
        const data = await this.mainDashboardService.getSmartStats();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('smart/low-stock')
    async getLowStock(@Query('limit') limit: number = 10) {
        const data = await this.mainDashboardService.getLowStock(limit);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('smart/alerts')
    async getSmartAlerts() {
        const data = await this.mainDashboardService.getSmartAlerts();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('smart/charts')
    async getSmartCharts(
        @Query('type') type: string,
        @Query('range') range: string = '30d'
    ) {
        if (!type) {
            return {
                success: false,
                message: 'Parameter type is required'
            };
        }
        const data = await this.mainDashboardService.getSmartCharts(type, range);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('smart/plans-at-risk')
    async getPlansAtRisk() {
        const data = await this.mainDashboardService.getPlansAtRisk();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }
}
