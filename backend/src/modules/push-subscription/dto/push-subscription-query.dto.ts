import { IsOptional, IsString, IsNumber, IsDateString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PushSubscriptionQueryDto {
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
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    user_id?: number;

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
