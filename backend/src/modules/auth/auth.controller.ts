import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { AtGuard } from 'src/common/guards/at.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { access_token, refresh_token } = await this.authService.login(req.user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
    return {
      message: 'Login Successful!!',
      user: req.user
    };
  }

  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const { newAccessToken, user } = await this.authService.reFresh(req.cookies['refresh_token']);
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
    return {
      message: 'Refresh Successful!!',
      user
    }
  }

}
