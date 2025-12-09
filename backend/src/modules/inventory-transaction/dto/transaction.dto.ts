import { IsNumber, IsOptional, IsString, IsEnum, IsNotEmpty, IsDate, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../common/enums';

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

/**
 * DTO สำหรับ query inventory transactions
 */
export class InventoryTransactionQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    material_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;

    @IsOptional()
    @IsEnum(TransactionType)
    transaction_type?: TransactionType;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    start_date?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    end_date?: Date;

    @IsOptional()
    @IsString()
    reference_number?: string;

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
    sort_by?: string = 'created_at';

    @IsOptional()
    @IsString()
    sort_order?: 'ASC' | 'DESC' = 'DESC';
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
