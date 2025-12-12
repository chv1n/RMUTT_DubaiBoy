import { IsOptional, IsString, IsNumber, IsIn, IsEnum, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { PlanStatusEnum } from '../enum/plan-status.enum';
import { PlanPriorityEnum } from '../enum/plan-priority.enum';

/**
 * DTO สำหรับ Query Product Plans
 * รองรับ filter และ search
 */
export class ProductPlanQueryDto extends BaseQueryDto {
    @IsOptional()
    @IsString()
    search?: string;  // ค้นหา plan_name, plan_description

    @IsOptional()
    @IsString()
    @IsIn(['DRAFT', 'PENDING', 'PRODUCTION', 'COMPLETED', 'CANCELLED'])
    plan_status?: string;

    @IsOptional()
    @IsString()
    @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    plan_priority?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    product_id?: number;

    @IsOptional()
    @IsDateString()
    start_date_from?: string;  // filter start_date >= 

    @IsOptional()
    @IsDateString()
    start_date_to?: string;    // filter start_date <=

    @IsOptional()
    @IsDateString()
    end_date_from?: string;

    @IsOptional()
    @IsDateString()
    end_date_to?: string;
}
