import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req?.cookies?.['refresh_token'];
                },
            ]),
            passReqToCallback: true,
            secretOrKey: configService.get<string>('JWT_SECRET_REFRESH'),
        });
    }

    validate(req: Request, payload: any) {
        const refreshToken = req.cookies?.refresh_token;;
        if (!refreshToken) throw new UnauthorizedException('NO_REFRESH_TOKEN');

        return { ...payload, refreshToken };
    }

}