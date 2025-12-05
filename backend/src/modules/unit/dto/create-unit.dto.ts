import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUnitDto {
    @IsString()
    @IsNotEmpty()
    unit_name: string;
}
