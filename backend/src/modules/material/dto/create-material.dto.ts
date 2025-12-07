import { IsString, IsOptional, IsNumber, IsDateString, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { IsLessThanOrEqual } from '../../../common/validators/is-less-than-or-equal.validator';

export class CreateMaterialDto {
    @IsOptional()
    @IsNumber()
    material_group_id?: number;

    @IsString()
    material_name: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    order_leadtime?: number;

    @IsOptional()
    @IsNumber()
    container_type_id?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity_per_container?: number;

    @IsOptional()
    @IsNumber()
    unit_id?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @IsLessThanOrEqual('container_max_stock', {
        message: 'container_min_stock must be less than or equal to container_max_stock',
    })
    container_min_stock?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    container_max_stock?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    lifetime?: number;

    @IsOptional()
    @IsString()
    lifetime_unit?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    cost_per_unit?: number;

    @IsOptional()
    @IsDateString()
    expiration_date?: string;

    @IsOptional()
    @IsNumber()
    supplier_id?: number;
}
