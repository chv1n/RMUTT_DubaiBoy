import { IsOptional, IsString } from "class-validator";

export class CreateWarehouseMasterDto {

    @IsString()
    @IsOptional()
    warehosue_name?: string;

    @IsString()
    @IsOptional()
    warehouse_code?: string;

    @IsString()
    @IsOptional()
    warehouse_phone?: string;

    @IsString()
    @IsOptional()
    warehouse_address?: string;


}
