import { Controller, Get, Query } from '@nestjs/common';
import { DashboardSupplierService } from '../services/dashboard-supplier.service';

@Controller({
    path: 'suppliers/stats',
    version: '1',
})
export class SupplierDashboardController {
    constructor(private readonly dashboardService: DashboardSupplierService) { }

    @Get('summary')
    async getSummary() {
        const data = await this.dashboardService.getStatsSummary();
        return {
            success: true,
            data,
        };
    }

    @Get('spending')
    async getSpending(@Query('type') type: 'monthly' | 'category') {
        const data = await this.dashboardService.getSpendingAnalytics(type);
        return {
            success: true,
            data,
        };
    }

    @Get('top-performing')
    async getTopPerforming() {
        const data = await this.dashboardService.getTopSuppliers();
        return {
            success: true,
            data,
        };
    }
}
