import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class CreateMaterialGroupDto {
    @IsString()
    @IsNotEmpty()
    group_name: string;

    @IsString()
    @IsNotEmpty()
    abbreviation: string;

    @IsBoolean()
    is_active: boolean;
}
