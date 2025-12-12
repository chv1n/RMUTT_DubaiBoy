import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO สำหรับการปรับปรุงยอดคงคลัง (Inventory Adjustment)
 */
export class InventoryAdjustmentDto {
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
    quantity_change: number;

    @IsString()
    @IsNotEmpty({ message: 'Reason/Remarks is required for adjustment' })
    reason_remarks: string;

    @IsOptional()
    @IsString()
    reference_number?: string;
}
