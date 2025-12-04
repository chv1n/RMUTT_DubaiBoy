import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req: Request) => {
                    return req?.cookies?.['access_token'];
                },
            ]),
            secretOrKey: configService.get<string>('JWT_SECRET_ACCESS'),
        });
    }

    async validate(payload: any) {
        const user = {
            email: payload.email,
            id: payload.id,
            username: payload.user_name,
            role: payload.role
        }
        return user;
    }
}