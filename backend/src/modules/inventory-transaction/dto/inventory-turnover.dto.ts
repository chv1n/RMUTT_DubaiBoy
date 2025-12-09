import { IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
