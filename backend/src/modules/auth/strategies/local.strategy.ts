import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validate(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      username: user.username,
      role: user.role,
      active: user.active,
      email: user.email,
      id: user.id,
      fullname: user.fullname
    };
  }
}
