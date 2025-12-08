import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMaterialInventoryDto {


    @IsNumber()
    @IsOptional()
    material_id?: number;

    @IsNumber()
    @IsOptional()
    warehouse_id?: number;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsNumber()
    @IsOptional()
    supplier_id?: number;

    @IsString()
    @IsOptional()
    order_number?: string;


}
