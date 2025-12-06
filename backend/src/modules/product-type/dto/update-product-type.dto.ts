import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateProductTypeDto {

    @IsString()
    @IsOptional()
    type_name?: string;

    @IsNumber()
    @IsOptional()
    active?: number;
}
