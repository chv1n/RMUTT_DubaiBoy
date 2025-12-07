import { IsOptional, IsString, IsNumber, IsDateString, IsIn, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class MaterialQueryDto {
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
    @Type(() => Number)
    @IsNumber()
    material_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    material_group_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    container_type_id?: number;

    @IsOptional()
    @IsString()
    unit_id?: string;

    @IsOptional()
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_active?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsDateString()
    expiration_before?: string;

    @IsOptional()
    @IsDateString()
    expiration_after?: string;

    @IsOptional()
    @IsDateString()
    updated_before?: string;

    @IsOptional()
    @IsDateString()
    updated_after?: string;

    @IsOptional()
    @IsString()
    sort_by?: string;

    @IsOptional()
    @IsString()
    @IsIn(['asc', 'desc', 'ASC', 'DESC'])
    sort_order?: string = 'desc';
}
