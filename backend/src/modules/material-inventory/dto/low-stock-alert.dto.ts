import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

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
