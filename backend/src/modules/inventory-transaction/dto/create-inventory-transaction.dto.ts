import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateInventoryTransactionDto {

    @IsNumber()
    @IsOptional()
    warehouse_id?: number;

    @IsNumber()
    material_inventory_id: number;

    @IsString()
    transaction_type: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    transaction_date?: Date;

    @IsNumber()
    @IsOptional()
    quantity_change?: number;

    @IsString()
    @IsOptional()
    reference_number?: string;

    @IsString()
    @IsOptional()
    reason_remarks?: string;
}
