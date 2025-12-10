import { IsOptional, IsString, IsNumber, IsDateString, IsIn, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductQueryDto {
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
    product_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    product_type_id?: number;

    @IsOptional()
    @IsString()
    product_type_name?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    is_active?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsDateString()
    created_before?: string;

    @IsOptional()
    @IsDateString()
    created_after?: string;

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
