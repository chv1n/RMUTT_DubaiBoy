import { IsString, IsNotEmpty } from 'class-validator';

export class CreateContainerTypeDto {
    @IsString()
    @IsNotEmpty()
    type_name: string;
}
