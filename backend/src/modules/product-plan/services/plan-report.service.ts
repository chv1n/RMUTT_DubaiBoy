import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ProductPlan } from '../entities/product-plan.entity';
import { ReportQueryDto, ReportPeriod } from '../dto/report-query.dto';
import { PlanStatusEnum } from '../enum/plan-status.enum';

/**
 * Interface สำหรับ Report Summary
 */
export interface IReportSummary {
    period: string;
    start_date: string;
    end_date: string;
    total_plans: number;
    completed_plans: number;
    cancelled_plans: number;
    production_plans: number;
    pending_plans: number;
    total_planned_quantity: number;
    total_produced_quantity: number;
    total_estimated_cost: number;
    total_actual_cost: number;
    by_product: IProductSummary[];
}

export interface IProductSummary {
    product_id: number;
    product_name: string;
    plan_count: number;
    planned_quantity: number;
    produced_quantity: number;
    estimated_cost: number;
    actual_cost: number;
}

/**
 * Service สำหรับ Production Report
 * 
 * Single Responsibility: จัดการเฉพาะ report/summary
 */
@Injectable()
export class PlanReportService {
    constructor(
        @InjectRepository(ProductPlan)
        private readonly planRepository: Repository<ProductPlan>,
    ) { }

    /**
     * Get Production Summary Report
     * รองรับ filter แบบ day, week, month
     */
    async getSummary(query: ReportQueryDto): Promise<IReportSummary> {
        const { startDate, endDate } = this.getDateRange(query);

        // Query plans ในช่วงเวลา
        const plans = await this.planRepository.find({
            where: {
                created_at: Between(startDate, endDate),
            },
            relations: ['product'],
        });

        // คำนวณ summary
        const summary: IReportSummary = {
            period: query.period || ReportPeriod.MONTH,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            total_plans: plans.length,
            completed_plans: 0,
            cancelled_plans: 0,
            production_plans: 0,
            pending_plans: 0,
            total_planned_quantity: 0,
            total_produced_quantity: 0,
            total_estimated_cost: 0,
            total_actual_cost: 0,
            by_product: [],
        };

        // Group by product
        const productMap = new Map<number, IProductSummary>();

        for (const plan of plans) {
            // Count by status
            switch (plan.plan_status) {
                case PlanStatusEnum.COMPLETED:
                    summary.completed_plans++;
                    break;
                case PlanStatusEnum.CANCELLED:
                    summary.cancelled_plans++;
                    break;
                case PlanStatusEnum.PRODUCTION:
                    summary.production_plans++;
                    break;
                case PlanStatusEnum.PENDING:
                    summary.pending_plans++;
                    break;
            }

            // Sum quantities and costs
            summary.total_planned_quantity += plan.input_quantity || 0;
            summary.total_produced_quantity += plan.actual_produced_quantity || 0;
            summary.total_estimated_cost += Number(plan.estimated_cost) || 0;
            summary.total_actual_cost += Number(plan.actual_cost) || 0;

            // Group by product
            if (!productMap.has(plan.product_id)) {
                productMap.set(plan.product_id, {
                    product_id: plan.product_id,
                    product_name: plan.product?.product_name || 'Unknown',
                    plan_count: 0,
                    planned_quantity: 0,
                    produced_quantity: 0,
                    estimated_cost: 0,
                    actual_cost: 0,
                });
            }

            const productSummary = productMap.get(plan.product_id)!;
            productSummary.plan_count++;
            productSummary.planned_quantity += plan.input_quantity || 0;
            productSummary.produced_quantity += plan.actual_produced_quantity || 0;
            productSummary.estimated_cost += Number(plan.estimated_cost) || 0;
            productSummary.actual_cost += Number(plan.actual_cost) || 0;
        }

        // Round costs
        summary.total_estimated_cost = Math.round(summary.total_estimated_cost * 100) / 100;
        summary.total_actual_cost = Math.round(summary.total_actual_cost * 100) / 100;

        // Convert map to array
        summary.by_product = Array.from(productMap.values()).map(p => ({
            ...p,
            estimated_cost: Math.round(p.estimated_cost * 100) / 100,
            actual_cost: Math.round(p.actual_cost * 100) / 100,
        }));

        return summary;
    }

    /**
     * คำนวณ date range ตาม period
     */
    private getDateRange(query: ReportQueryDto): { startDate: Date; endDate: Date } {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (query.start_date && query.end_date) {
            // Use provided dates
            startDate = new Date(query.start_date);
            endDate = new Date(query.end_date);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Calculate based on period
            switch (query.period) {
                case ReportPeriod.DAY:
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                    break;

                case ReportPeriod.WEEK:
                    const dayOfWeek = now.getDay();
                    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 6);
                    endDate.setHours(23, 59, 59, 999);
                    break;

                case ReportPeriod.MONTH:
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    break;
            }
        }

        return { startDate, endDate };
    }
}
