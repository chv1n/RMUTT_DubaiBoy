import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {

    @IsString()
    @IsOptional()
    product_name?: string;

    @IsNumber()
    @IsOptional()
    product_type_id?: number;
}
