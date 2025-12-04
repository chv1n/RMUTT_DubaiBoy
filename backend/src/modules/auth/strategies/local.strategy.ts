import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'user_name',
      passwordField: 'pass_word',
    });
  }

  async validate(user_name: string, pass_word: string): Promise<any> {
    const user = await this.authService.validate(user_name, pass_word);
    console.log(user)
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      user_name: user.user_name,
      role: user.role,
      active: user.active,
      email: user.email,
      id: user.id,
      fullname: user.fullname
    };
  }
}
