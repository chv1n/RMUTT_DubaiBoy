import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "./base-query.dto";

export class WarehouseDto extends BaseQueryDto {
    @IsNumber()
    @IsOptional()
    warehouse_id?: number;

    @IsString()
    @IsOptional()
    warehouse_name?: string;

    @IsString()
    @IsOptional()
    warehouse_address?: string;

    @IsString()
    @IsOptional()
    warehouse_phone?: string;

    @IsString()
    @IsOptional()
    warehouse_email?: string;

}