import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreatePushSubscriptionDto {
    @IsString()
    endpoint: string;

    @IsObject()
    keys: {
        auth: string;
        p256dh: string;
    };

    @IsNumber()
    @IsOptional()
    expirationTime?: number | null;
}
