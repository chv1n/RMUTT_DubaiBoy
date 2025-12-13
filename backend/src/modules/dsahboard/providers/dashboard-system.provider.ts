import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPlan } from '../../product-plan/entities/product-plan.entity';
import { Repository, Between } from 'typeorm';
import { PlanStatusEnum } from '../../product-plan/enum/plan-status.enum';

@Injectable()
export class DashboardSystemProvider {
    constructor(
        @InjectRepository(ProductPlan)
        private planRepository: Repository<ProductPlan>,
    ) { }

    async getSystemPerformance() {
        const systemPerformance: {
            month: string;
            revenue: number;
            expenses: number;
        }[] = [];
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const currentMonth = new Date().getMonth();

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const plansInMonth = await this.planRepository.find({
                where: {
                    updated_at: Between(monthStart, monthEnd),
                    plan_status: PlanStatusEnum.COMPLETED,
                },
            });

            const expenses = plansInMonth.reduce(
                (sum, p) => sum + (Number(p.actual_cost) || 0),
                0,
            );

            systemPerformance.push({
                month: monthNames[d.getMonth()],
                revenue: 0, // No revenue data available
                expenses: expenses,
            });
        }

        return systemPerformance;
    }
}
