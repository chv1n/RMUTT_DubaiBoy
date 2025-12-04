
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class UpdateDto {

    @IsString()
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    user_name?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    pass_word?: string;

    @IsString()
    @IsOptional()
    full_name?: string;


    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
