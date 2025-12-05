import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req?.cookies?.['access_token'];
                },
            ]),
            passReqToCallback: true,
            secretOrKey: configService.get<string>('JWT_SECRET_ACCESS'),
        });
    }

    async validate(req: Request, payload: any) {

        const user = {
            email: payload.email,
            id: payload.id,
            username: payload.username,
            role: payload.role
        }
        return user;
    }

    authenticate(req, options) {
        super.authenticate(req, options);
    }

    fail(info) {
        if (info?.message === 'jwt expired') {
            throw new UnauthorizedException('ACCESS_TOKEN_EXPIRED');
        }

        if (info?.message === 'invalid token') {
            throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
        }

        throw new UnauthorizedException('UNAUTHORIZED');
    }
}