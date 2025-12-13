import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPlan } from '../../product-plan/entities/product-plan.entity';
import { Repository } from 'typeorm';
import { PlanStatusEnum } from '../../product-plan/enum/plan-status.enum';

@Injectable()
export class DashboardAlertProvider {
    constructor(
        @InjectRepository(ProductPlan)
        private planRepository: Repository<ProductPlan>,
    ) { }

    async getAlerts(lowStockCount: number) {
        const alerts: {
            id: number;
            type: string;
            message: string;
            timestamp: Date;
            link: string;
        }[] = [];

        // Low stock alert
        if (lowStockCount > 0) {
            alerts.push({
                id: 1,
                type: 'warning',
                message: `${lowStockCount} Materials are low in stock`,
                timestamp: new Date(),
                link: '/materials',
            });
        }

        // Completed plan alert
        const lastCompleted = await this.planRepository.findOne({
            where: { plan_status: PlanStatusEnum.COMPLETED },
            order: { updated_at: 'DESC' },
        });
        if (lastCompleted) {
            alerts.push({
                id: 3,
                type: 'success',
                message: `Production Plan ${lastCompleted.plan_name} Completed`,
                timestamp: lastCompleted.updated_at,
                link: `/plans/${lastCompleted.id}`,
            });
        }

        return alerts;
    }
}
