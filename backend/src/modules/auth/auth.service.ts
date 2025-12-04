import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async validate(user_name: string, pass_word: string): Promise<any> {
    const user = await this.userService.findByUsername(user_name);
    if (user && (await bcrypt.compare(pass_word, user?.pass_word))) {
      return {
        ...user
      };
    }
    return null;
  }

  async login(user: any) {
    console.log(user)
    const payload = {
      ...user
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: 60 * 15,
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: 60 * 60 * 24 * 7,
      })
    };
  }

  async reFresh(resfreshToken: string) {



    const user = this.jwtService.verify(resfreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const newAccessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        user_name: user.user_name,
      },
      { expiresIn: '15m', secret: process.env.JWT_ACCESS_SECRET },
    );


    return { newAccessToken, user };
  }


  async logOut() {

  }

}
