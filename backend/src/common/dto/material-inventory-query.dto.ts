import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "./base-query.dto";
import { Transform, Type } from "class-transformer";

export class MaterialInventoryDto extends BaseQueryDto {

    @Transform(({ obj }) => obj.material_id ?? obj.material_id)
    @IsOptional()
    @Type(() => Number)
    material_id?: number;

    @Transform(({ obj }) => obj.warehouse_id ?? obj.warehouse_id)
    @IsOptional()
    @Type(() => Number)
    warehouse_id?: number;

    @Transform(({ obj }) => obj.supplier_id ?? obj.supplier_id)
    @IsOptional()
    @Type(() => Number)
    supplier_id?: number;

    @IsNumber()
    @IsOptional()
    quantity: number;

    @IsString()
    @IsOptional()
    order_number: string;
}   
