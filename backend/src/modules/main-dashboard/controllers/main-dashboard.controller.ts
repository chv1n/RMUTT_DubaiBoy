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
}
