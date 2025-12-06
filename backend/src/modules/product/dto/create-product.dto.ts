import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    product_name: string;

    @IsNumber()
    @IsNotEmpty()
    product_type_id: number;
}
