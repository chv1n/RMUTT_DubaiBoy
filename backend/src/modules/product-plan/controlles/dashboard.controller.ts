import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { DashboardPlanService } from '../services/dash-board.service';

@Controller({
    path: 'product-plans/dashboard',
    version: '1',
})
export class PlanDashboardController {
    constructor(private readonly planService: DashboardPlanService) { }

    @Get('stats')
    async getStats() {
        const data = await this.planService.getPlanStats();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('progress')
    async getProgress(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
        const data = await this.planService.getProgress(limit);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('status-distribution')
    async getStatusDistribution() {
        const data = await this.planService.getStatusDistribution();
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }
}
