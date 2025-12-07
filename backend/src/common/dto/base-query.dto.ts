import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

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
    @IsString()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'])
    sort_order?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC';
}
