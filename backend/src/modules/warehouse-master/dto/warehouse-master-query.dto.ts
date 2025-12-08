import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class WarehouseMasterQueryDto extends BaseQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;

    @IsOptional()
    @IsString()
    warehouse_name?: string;

    @IsOptional()
    @IsString()
    warehouse_address?: string;

    @IsOptional()
    @IsString()
    warehouse_phone?: string;

    @IsOptional()
    @IsString()
    warehouse_email?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sort_by?: string;
}
