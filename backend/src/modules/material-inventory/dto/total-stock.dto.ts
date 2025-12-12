import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

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
