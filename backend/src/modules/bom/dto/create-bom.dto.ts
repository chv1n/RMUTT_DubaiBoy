import { IsNumber, IsOptional } from "class-validator";

export class CreateBomDto {
    @IsNumber()
    product_id: number;
    @IsNumber()
    material_id: number;
    @IsNumber()
    usage_per_piece: number;
    @IsNumber()
    @IsOptional()
    version: number;
    @IsNumber()
    @IsOptional()
    active: number;
    @IsNumber()
    @IsOptional()
    scrap_factor: number;
}

