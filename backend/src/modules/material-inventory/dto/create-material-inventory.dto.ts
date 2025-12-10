import { IsNumber, IsOptional, IsString, IsNotEmpty, IsDate } from "class-validator";
import { Type } from "class-transformer";

export class CreateMaterialInventoryDto {


    @IsNumber()
    @IsNotEmpty()
    material_id: number;

    @IsNumber()
    @IsNotEmpty()
    warehouse_id: number;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;


    @IsString()
    @IsOptional()
    order_number?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    mfg_date?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    exp_date?: Date;


}
