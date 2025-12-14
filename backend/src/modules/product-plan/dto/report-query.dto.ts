import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum ReportPeriod {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
}

/**
 * DTO สำหรับ Query Report
 * รองรับ filter แบบ รายวัน, รายสัปดาห์, รายเดือน
 */
export class ReportQueryDto {
    @IsDateString()
    @IsOptional()
    start_date?: string;

    @IsDateString()
    @IsOptional()
    end_date?: string;

    @IsEnum(ReportPeriod)
    @IsOptional()
    period?: ReportPeriod = ReportPeriod.MONTH;
}
