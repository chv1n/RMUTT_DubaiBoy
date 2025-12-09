import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

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
