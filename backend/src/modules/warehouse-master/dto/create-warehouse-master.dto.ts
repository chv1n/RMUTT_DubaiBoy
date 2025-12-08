import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWarehouseMasterDto {

    @IsString()
    @IsNotEmpty()
    warehouse_name: string;

    @IsString()
    @IsNotEmpty()
    warehouse_code: string;

    @IsString()
    @IsOptional()
    warehouse_phone: string;

    @IsString()
    @IsOptional()
    warehouse_address: string;

    @IsString()
    @IsOptional()
    warehouse_email: string;



    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
