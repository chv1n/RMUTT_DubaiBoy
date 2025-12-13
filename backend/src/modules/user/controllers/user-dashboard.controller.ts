import { Controller, Get, Query } from '@nestjs/common';
import { DashboardUserService } from '../services/dashboard-user.service';

@Controller({
    path: 'users/dashboard',
    version: '1',
})
export class UserDashboardController {
    constructor(private readonly dashboardService: DashboardUserService) { }

    @Get('stats')
    async getStats(@Query('period') period: string) {
        const data = await this.dashboardService.getStats(period);
        return {
            success: true,
            message: 'สำเร็จ',
            data,
        };
    }

    @Get('activity')
    async getActivity(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const result = await this.dashboardService.getActivityLogs(Number(page), Number(limit));
        return {
            success: true,
            message: 'สำเร็จ',
            data: result.data,
            meta: result.meta
        };
    }
}
