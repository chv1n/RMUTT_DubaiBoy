import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
