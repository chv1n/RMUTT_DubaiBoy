import { IsNumber, IsOptional, IsString, IsNotEmpty, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO สำหรับการรับเข้าวัสดุ (Goods Receipt - IN)
 */
export class GoodsReceiptDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    material_id: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    warehouse_id: number;

    @IsNumber()
    @Type(() => Number)
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;

    @IsOptional()
    @IsString()
    reference_number?: string;

    @IsOptional()
    @IsString()
    reason_remarks?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    mfg_date?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    exp_date?: Date;

    @IsOptional()
    @IsString()
    order_number?: string;
}
