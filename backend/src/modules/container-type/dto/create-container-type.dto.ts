import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateContainerTypeDto {
    @IsString()
    @IsNotEmpty()
    type_name: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
