import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMaterialGroupDto {
    @IsString()
    @IsNotEmpty()
    group_name: string;

    @IsString()
    @IsNotEmpty()
    abbreviation: string;
}
