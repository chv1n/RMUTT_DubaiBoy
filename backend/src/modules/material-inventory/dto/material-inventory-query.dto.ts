import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "../../../common/dto/base-query.dto";
import { Type } from "class-transformer";

export class MaterialInventoryQueryDto extends BaseQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    material_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    warehouse_id?: number;


    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsString()
    order_number?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sort_by?: string;
}
