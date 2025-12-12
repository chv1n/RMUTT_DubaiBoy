import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO สำหรับการโอนย้ายระหว่างโกดัง (Warehouse Transfer)
 */
export class WarehouseTransferDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    material_id: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    source_warehouse_id: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    target_warehouse_id: number;

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
}

/**
 * Response สำหรับ Transfer result
 */
export interface TransferResultDto {
    transfer_out_transaction_id: number;
    transfer_in_transaction_id: number;
    material_id: number;
    source_warehouse_id: number;
    target_warehouse_id: number;
    quantity: number;
    message: string;
}
