import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    @IsOptional()
    supplier_name: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
