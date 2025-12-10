import { IsNumber, IsOptional, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../common/enums';

/**
 * DTO สำหรับ query การสอบย้อนกลับ (Traceability)
 */
export class TraceabilityQueryDto {
    @IsOptional()
    @IsString()
    reference_number?: string;

    @IsOptional()
    @IsString()
    order_number?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    material_id?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    start_date?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    end_date?: Date;

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
 * Response DTO สำหรับ Traceability
 */
export interface TraceabilityResponseDto {
    reference_number: string;
    transactions: {
        transaction_id: number;
        material_id: number;
        material_name: string;
        warehouse_id: number;
        warehouse_name: string;
        transaction_type: TransactionType;
        quantity_change: number;
        transaction_date: Date;
        reason_remarks?: string;
    }[];
    related_orders: string[];
}
