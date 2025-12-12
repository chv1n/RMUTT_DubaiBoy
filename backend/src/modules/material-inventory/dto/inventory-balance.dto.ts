import { IsNumber, IsOptional, IsString, IsEnum, IsDate, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { LotStrategy } from '../../../common/enums';

/**
 * DTO สำหรับ query ยอดคงคลังตามโกดัง
 */
export class StockByWarehouseQueryDto extends BaseQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    material_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    include_zero_stock?: boolean = false;
}

/**
 * DTO สำหรับ query ยอดคงคลังรวม
 */
export class TotalStockQueryDto extends BaseQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    material_id?: number;

    @IsOptional()
    @IsString()
    material_name?: string;

    @IsOptional()
    @IsString()
    search?: string;
}

/**
 * DTO สำหรับ query Lot/Batch
 */
export class LotBatchQueryDto {
    @IsNumber()
    @Type(() => Number)
    material_id: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;

    @IsOptional()
    @IsEnum(LotStrategy)
    strategy?: LotStrategy = LotStrategy.FIFO;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    quantity_needed?: number;
}

/**
 * DTO สำหรับการตั้งค่า Low Stock Alert
 */
export class LowStockAlertConfigDto {
    @IsNumber()
    @Type(() => Number)
    material_id: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    reorder_point: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;
}

/**
 * DTO สำหรับ query Low Stock Alert
 */
export class LowStockQueryDto extends BaseQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    threshold?: number;
}

/**
 * Response DTO สำหรับ Stock by Warehouse
 */
export interface StockByWarehouseResponseDto {
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
    mfg_date?: Date;
    exp_date?: Date;
    order_number?: string;
}

/**
 * Response DTO สำหรับ Total Stock
 */
export interface TotalStockResponseDto {
    material_id: number;
    material_name: string;
    total_quantity: number;
    warehouse_breakdown: {
        warehouse_id: number;
        warehouse_name: string;
        quantity: number;
    }[];
}

/**
 * Response DTO สำหรับ Low Stock Alert
 */
export interface LowStockAlertResponseDto {
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    current_quantity: number;
    reorder_point: number;
    shortage_quantity: number;
    is_critical: boolean;
}

/**
 * Response DTO สำหรับ Lot/Batch suggestion
 */
export interface LotBatchSuggestionDto {
    inventory_id: number;
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
    mfg_date?: Date;
    exp_date?: Date;
    order_number?: string;
    suggested_quantity: number;
}
