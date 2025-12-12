import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateMaterialGroupDto {
    @IsString()
    @IsNotEmpty()
    group_name: string;

    @IsString()
    @IsNotEmpty()
    abbreviation: string;

    @IsBoolean()
    @IsOptional()
    is_active: boolean;
}
