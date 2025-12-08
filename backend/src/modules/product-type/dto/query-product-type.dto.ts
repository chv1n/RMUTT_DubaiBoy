import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductTypeDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC' = 'ASC';

    @IsOptional()
    @IsString()
    sortBy?: string = 'product_id';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    offset?: number = 0;

    @IsOptional()
    @IsString()
    name?: string = '';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    active?: number = 1;
}
