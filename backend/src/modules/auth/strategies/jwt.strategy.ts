import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get('JWT_SECRET_ACCESS');
    if (!secret) throw new Error('Secret is not defined!!');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log(request?.cookies?.access_token);
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return {
      username: payload.username,
      role: payload.role,
      email: payload.email,
      id: payload.id,
    };
  }
}
