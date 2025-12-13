import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../enums';

export class SendNotificationDto {
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    data?: Record<string, any>;
}
