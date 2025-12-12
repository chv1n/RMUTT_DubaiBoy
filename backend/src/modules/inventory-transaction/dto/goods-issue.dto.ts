import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO สำหรับการเบิก/จ่ายวัสดุ (Goods Issue - OUT)
 */
export class GoodsIssueDto {
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

    @IsString()
    @IsNotEmpty({ message: 'Reference number is required for goods issue' })
    reference_number: string;

    @IsOptional()
    @IsString()
    reason_remarks?: string;
}
