import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class SubscriptionDto {

    @IsString()
    @IsOptional()
    endpoint: string;

    @IsOptional()
    keys: {
        auth: string;
        p256dh: string;
    };

    @IsNumber()
    @IsOptional()
    expirationTime?: number | null;
}