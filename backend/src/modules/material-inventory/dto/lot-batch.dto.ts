import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LotStrategy } from '../../../common/enums';

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
