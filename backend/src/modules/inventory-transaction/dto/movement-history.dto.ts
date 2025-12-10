import { IsNumber, IsOptional, IsEnum, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../common/enums';

/**
 * DTO สำหรับ query รายงานประวัติการเคลื่อนไหว
 */
export class MovementHistoryQueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    material_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    start_date?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    end_date?: Date;

    @IsOptional()
    @IsEnum(TransactionType)
    transaction_type?: TransactionType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}

/**
 * Response DTO สำหรับ Movement History
 */
export interface MovementHistoryResponseDto {
    transaction_id: number;
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    transaction_type: TransactionType;
    quantity_change: number;
    reference_number?: string;
    reason_remarks?: string;
    transaction_date: Date;
    created_at: Date;
}
