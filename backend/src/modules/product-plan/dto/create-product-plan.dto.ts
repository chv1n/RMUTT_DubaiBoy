import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductPlanDto {

    @IsNumber()
    @IsOptional()
    product_id: number;

    @IsString()
    @IsOptional()
    plan_name: string;

    @IsString()
    @IsOptional()
    plan_description: string;

    @IsDateString()
    @IsOptional()
    start_date: string;

    @IsDateString()
    @IsOptional()
    end_date: string;

    @IsNumber()
    @IsOptional()
    input_quantity: number;

    @IsString()
    @IsOptional()
    plan_status: string;

    @IsString()
    @IsOptional()
    plan_priority: string;
}
