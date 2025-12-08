import { PartialType } from '@nestjs/mapped-types';
import { CreateWarehouseMasterDto } from './create-warehouse-master.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWarehouseMasterDto extends PartialType(CreateWarehouseMasterDto) {


    @IsString()
    @IsOptional()
    warehouse_name?: string;

    @IsString()
    @IsOptional()
    warehouse_code?: string;

    @IsString()
    @IsOptional()
    warehouse_phone?: string;

    @IsString()
    @IsOptional()
    warehouse_address?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
