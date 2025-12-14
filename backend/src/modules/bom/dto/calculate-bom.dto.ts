import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateBomDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    product_id: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    quantity: number;
}
