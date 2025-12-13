import { Controller, Get } from '@nestjs/common';
import { DashboardProductService } from '../services/dashboard-product.service';

@Controller({
    path: 'products/dashboard',
    version: '1',
})
export class ProductDashboardController {
    constructor(private readonly dashboardService: DashboardProductService) { }

    @Get('stats')
    async getStats() {
        const data = await this.dashboardService.getStats();
        return {
            success: true,
            data,
        };
    }

    @Get('distribution')
    async getDistribution() {
        const data = await this.dashboardService.getCategoryDistribution();
        return {
            success: true,
            data,
        };
    }

    @Get('cost-trends')
    async getCostTrends() {
        const data = await this.dashboardService.getCostTrends();
        return {
            success: true,
            data,
        };
    }
}
