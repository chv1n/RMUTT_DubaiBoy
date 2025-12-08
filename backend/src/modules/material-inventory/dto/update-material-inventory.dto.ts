import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialInventoryDto } from './create-material-inventory.dto';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMaterialInventoryDto extends PartialType(CreateMaterialInventoryDto) {
    @IsNumber()
    @IsOptional()
    material_id?: number;

    @IsNumber()
    @IsOptional()
    warehouse_id?: number;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsNumber()
    @IsOptional()
    supplier_id?: number;

    @IsString()
    @IsOptional()
    order_number?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    mfg_date?: Date;
}
