import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsString()
    @IsOptional()
    product_name?: string;

    @IsNumber()
    @IsOptional()
    product_type_id?: number;

    @IsNumber()
    @IsOptional()
    active?: number;
}

