import { IsNumber, IsOptional, IsString, IsEnum, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../common/enums';

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
