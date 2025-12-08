import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateProductTypeDto {

    @IsString()
    @IsNotEmpty()
    type_name: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
