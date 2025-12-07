import { IsOptional, IsBoolean, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BaseQueryDto {
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'])
    sort_order?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC';
}
