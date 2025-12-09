import { IsNumber, IsOptional, IsString, IsDate, Min, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../common/enums';

/**
 * DTO สำหรับ query รายงานประวัติการเคลื่อนไหว
 */
export class MovementHistoryQueryDto {
    @IsNumber()
    @Type(() => Number)
    material_id: number;

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
 * DTO สำหรับ query รายงาน Inventory Turnover
 */
export class InventoryTurnoverQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
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
 * DTO สำหรับ query รายงานยอดคงคลังตามสถานที่
 */
export class StockLocationQueryDto {
    @IsNumber()
    @Type(() => Number)
    warehouse_id: number;

    @IsOptional()
    @IsString()
    search?: string;

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

    @IsOptional()
    @IsString()
    sort_by?: string = 'material_name';

    @IsOptional()
    @IsString()
    sort_order?: 'ASC' | 'DESC' = 'ASC';
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

/**
 * Response DTO สำหรับ Inventory Turnover
 */
export interface InventoryTurnoverResponseDto {
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    average_inventory: number;
    total_out_quantity: number;
    turnover_rate: number;
    days_in_inventory: number;
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

/**
 * Response DTO สำหรับ Stock Location Report
 */
export interface StockLocationResponseDto {
    warehouse_id: number;
    warehouse_name: string;
    warehouse_code: string;
    materials: {
        material_id: number;
        material_name: string;
        quantity: number;
        mfg_date?: Date;
        exp_date?: Date;
        order_number?: string;
    }[];
    total_items: number;
}
