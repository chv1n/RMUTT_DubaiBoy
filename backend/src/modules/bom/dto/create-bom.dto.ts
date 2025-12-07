import { IsNumber } from "class-validator";

export class CreateBomDto {
    @IsNumber()
    product_id: number;
    @IsNumber()
    material_id: number;
    @IsNumber()
    usage_per_piece: number;
    @IsNumber()
    unit_id: number;
    @IsNumber()
    version: number;
    @IsNumber()
    active: number;
    @IsNumber()
    scrap_factor: number;
}
