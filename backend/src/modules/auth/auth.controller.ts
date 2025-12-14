import {
  Controller,
  Post,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { AtGuard } from 'src/common/guards/at.guard';
import { RtGuard } from 'src/common/guards/rt.guard';

@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken } = await this.authService.login(req.user);
    this.setCookies(res, accessToken, refreshToken);
    return {
      message: 'Login Successful!!',
      data: req.user
    };
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken } = await this.authService.refresh(req.cookies['refresh_token'], req.user);
    this.setCookies(res, accessToken, refreshToken);
    return {
      message: 'Refresh Successful!!',
    }
  }

  @UseGuards(AtGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    await this.authService.logout(req.user.id)
    return {
      message: 'Logout Successful!!',
    }
  }

  private setCookies(res, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
  }

}
