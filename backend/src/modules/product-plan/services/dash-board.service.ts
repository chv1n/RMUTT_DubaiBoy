import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPlan } from '../../product-plan/entities/product-plan.entity';
import { Repository, LessThanOrEqual } from 'typeorm';
import { PlanStatusEnum } from '../../product-plan/enum/plan-status.enum';
import { Status } from 'src/common/enums/status.enum';

@Injectable()
export class DashboardPlanService {
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
        const pendingPlans = await this.planRepository.count({
            where: { plan_status: PlanStatusEnum.PENDING },
        });
        const allPlans = await this.planRepository.find();

        const totalPlans = allPlans.length;
        const totalProductionTarget = allPlans.reduce(
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

        // --- Trend Calculation (7 days ago) ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Active Plans Trend
        // Active 7 days ago approx = Created <= 7 days ago AND (Completed > 7 days ago OR Not Completed) AND (Cancelled > 7 days ago OR Not Cancelled)
        // This is complex to do purely in code without event sourcing or audit log, but we can approximate using timestamps.

        // Easier approach with query builder
        /*
        const active7DaysAgo = await this.planRepository.createQueryBuilder('plan')
            .where('plan.created_at <= :date', { date: sevenDaysAgo })
            .andWhere('(plan.completed_at IS NULL OR plan.completed_at > :date)', { date: sevenDaysAgo })
            .andWhere('(plan.cancelled_at IS NULL OR plan.cancelled_at > :date)', { date: sevenDaysAgo })
            .andWhere('plan.plan_status != :draft', { draft: PlanStatusEnum.DRAFT }) // Assuming DRAFT became PENDING at some point? ignoring draft transition complexity for now.
            .getCount();
        */

        // Let's implement active plans trend as simple difference for now or use the logic above.
        // Active Plans now: PENDING or PRODUCTION.
        // If we assume standard flow DRAFT -> PENDING -> PRODUCTION -> COMPLETED/CANCELLED
        // Active 7 Days Ago = (Created <= 7dA) - (Completed <= 7dA) - (Cancelled <= 7dA)
        // Wait, that's "Cumulative Active", not "Current Active Snapshot".
        // Snapshot = CreatedBefore - EndedBefore.
        // Ended = Completed OR Cancelled.

        const createdBefore7d = await this.planRepository.count({
            where: { created_at: LessThanOrEqual(sevenDaysAgo) }
        });
        const completedBefore7d = await this.planRepository.count({
            where: { completed_at: LessThanOrEqual(sevenDaysAgo), plan_status: PlanStatusEnum.COMPLETED }
        });
        const cancelledBefore7d = await this.planRepository.count({
            where: { cancelled_at: LessThanOrEqual(sevenDaysAgo), plan_status: PlanStatusEnum.CANCELLED }
        });

        // We also need to filter out DRAFTs if they are not considered "Active" in the past. 
        // But created_at usually is when DRAFT is made.
        // Let's assume we track "Active" meaning in progress. 
        // If strict, we need started_at. But let's use created_at as proxy for "Plan entering system".

        // Let's approximate Active 7 Days Ago = CreatedBefore7d - (CompletedBefore7d + CancelledBefore7d)
        // This assumes everything created is active until completed/cancelled.
        const active7DaysAgo = Math.max(0, createdBefore7d - (completedBefore7d + cancelledBefore7d));

        const activeTrend = activePlans - active7DaysAgo;

        // 2. On Time Rate Trend
        // Calculate rate as it was 7 days ago.
        const completedListBefore7d = allPlans.filter(
            (p) =>
                p.plan_status === PlanStatusEnum.COMPLETED &&
                p.completed_at &&
                p.completed_at <= sevenDaysAgo &&
                p.end_date
        );

        let onTimeCount7d = 0;
        completedListBefore7d.forEach((p) => {
            if (p.completed_at <= p.end_date) onTimeCount7d++;
        });

        const onTimeRate7d = completedListBefore7d.length > 0
            ? (onTimeCount7d / completedListBefore7d.length) * 100
            : 0; // If no completed plans 7 days ago, trend is from 0 or baseline? Let's say 0.

        // If currently 100% and before 0% (because no data), it shows +100%. 
        // Maybe check if completedListBefore7d is empty to handle gracefully?
        // If empty, change is 0 or current rate? 
        const onTimeRateChange = completedListBefore7d.length > 0 ? (onTimeRate - onTimeRate7d) : 0;

        return {
            total_plans: totalPlans,
            active_plans: activePlans,
            completed_plans: completedPlans,
            pending_plans: pendingPlans,
            total_production_target: totalProductionTarget,
            on_time_rate: parseFloat(onTimeRate.toFixed(2)),
            trend: {
                active_plans: `${activeTrend > 0 ? '+' : ''}${activeTrend}`,
                on_time_rate: `${onTimeRateChange > 0 ? '+' : ''}${onTimeRateChange.toFixed(1)}%`
            }
        };
    }

    async getProgress(limit: number = 5) {
        const activePlans = await this.planRepository.find({
            where: [
                { plan_status: Status.PENDING },
                { plan_status: Status.IN_PROGRESS }
            ],
            take: limit,
            order: { end_date: 'ASC' }
        });

        return activePlans.map(p => ({
            plan_id: p.id,
            plan_name: p.plan_name,
            target: p.input_quantity || 0,
            produced: p.actual_produced_quantity || 0,
            status: p.plan_status,
            progress_percent: p.input_quantity ? Math.min(100, Math.round(((p.actual_produced_quantity || 0) / p.input_quantity) * 100)) : 0,
            due_date: p.end_date
        }));
    }

    async getStatusDistribution() {
        const plans = await this.planRepository.createQueryBuilder('plan')
            .select('plan.plan_status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('plan.plan_status')
            .getRawMany();

        const colors = {
            [Status.PENDING]: '#f59e0b',
            [Status.IN_PROGRESS]: '#10b981',
            [Status.COMPLETED]: '#6366f1',
            [Status.CANCELLED]: '#ef4444',
            [Status.DRAFT]: '#9ca3af'
        };

        return plans.map(p => ({
            name: p.status,
            value: Number(p.count),
            color: colors[p.status] || '#cccccc'
        }));
    }
}
