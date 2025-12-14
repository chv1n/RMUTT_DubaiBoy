import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPlan } from '../../product-plan/entities/product-plan.entity';
import { Repository } from 'typeorm';
import { PlanStatusEnum } from '../../product-plan/enum/plan-status.enum';

@Injectable()
export class DashboardPlanProvider {
    constructor(
        @InjectRepository(ProductPlan)
        private planRepository: Repository<ProductPlan>,
    ) { }

    async getPlanStats() {
        const activePlans = await this.planRepository.count({
            where: [
                { plan_status: PlanStatusEnum.PENDING },
                { plan_status: PlanStatusEnum.PRODUCTION }
            ]
        });
        const completedPlans = await this.planRepository.count({
            where: { plan_status: PlanStatusEnum.COMPLETED },
        });
        const allPlans = await this.planRepository.find();
        const totalTarget = allPlans.reduce(
            (sum, p) => sum + (p.input_quantity || 0),
            0,
        );

        // Calculate OnTime Rate
        const completedList = allPlans.filter(
            (p) =>
                p.plan_status === PlanStatusEnum.COMPLETED &&
                p.completed_at &&
                p.end_date,
        );
        let onTimeCount = 0;
        completedList.forEach((p) => {
            if (p.completed_at <= p.end_date) onTimeCount++;
        });
        const onTimeRate =
            completedList.length > 0
                ? (onTimeCount / completedList.length) * 100
                : 100;

        return {
            active: activePlans,
            completed: completedPlans,
            totalTarget,
            onTimeRate: parseFloat(onTimeRate.toFixed(2)),
            trend: 'stable', // Mock
        };
    }
}
