import { IsNotEmpty, IsString } from "class-validator";

export class CreateProductTypeDto {

    @IsString()
    @IsNotEmpty()
    type_name: string;
}
