import { IsNumber, IsOptional, IsBooleanString } from "class-validator";
import { BaseQueryDto } from "src/common/dto/base-query.dto";
import { Transform } from "class-transformer";

export class GetBomDto extends BaseQueryDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    product_id?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    material_id?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    unit_id?: number;

    @IsOptional()
    @IsBooleanString()
    active?: boolean;
}
