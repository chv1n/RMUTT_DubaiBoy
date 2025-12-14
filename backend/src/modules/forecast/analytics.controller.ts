import { Body, Controller, Get, Post } from '@nestjs/common';
import { ForecastService } from './forecast.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly forecastService: ForecastService) { }

    @Post('predict/material')
    async predictMaterial(@Body() body: { material_id: number; target_date: string }) {
        // Calculate days between now and target_date
        const target = new Date(body.target_date);
        const today = new Date();
        const diffTime = Math.abs(target.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Ensure at least 1 day
        const days = diffDays > 0 ? diffDays : 1;

        const data = await this.forecastService.predictMaterialUsage(body.material_id, days, body.target_date);
        return {
            success: true,
            message: 'Prediction successful',
            data,
        };
    }

    @Get('predict/overview')
    async getOverview() {
        const data = await this.forecastService.getMaterialPredictionOverview();
        return {
            success: true,
            data,
        };
    }
}
