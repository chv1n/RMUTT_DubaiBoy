import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateUnitDto {
    @IsString()
    @IsNotEmpty()
    unit_name: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
