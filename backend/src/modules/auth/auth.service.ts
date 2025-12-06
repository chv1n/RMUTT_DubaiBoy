import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS') private redis: Redis,
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }

  async validate(user_name: string, pass_word: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username: user_name } });
    if (user && (await bcrypt.compare(pass_word, user.password))) {
      return {
        ...user
      };
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      ...user
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_ACCESS,
      expiresIn: 60 * 15,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_REFRESH,
      expiresIn: 60 * 60 * 24 * 7,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    try {
      await this.userService.update(user.id, { refresh_token: hashedRefreshToken });
    } catch (err) {
      console.warn(err);
    }

    try {
      await this.redis.set(
        `refresh_token:${user.id}`,
        hashedRefreshToken,
        'EX',
        60 * 60 * 24 * 7
      );
    } catch (err) {
      console.warn(err);
    }

    return {
      accessToken,
      refreshToken
    };

  }


  async refresh(refreshToken: string, user: User) {

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    let storedHash: string | null = null;

    try {
      storedHash = await this.redis.get(`refresh_token:${user.id}`);
    } catch (e) {
      console.warn("Redis unavailable — fallback to DB");
    }


    if (!storedHash) {
      const userFromDb = await this.userRepository.findOne({ where: { id: user.id } });
      storedHash = userFromDb?.refresh_token || null;
    }

    if (!storedHash) {
      throw new UnauthorizedException("Refresh token not found");
    }


    const valid = await bcrypt.compare(refreshToken, storedHash);
    if (!valid) throw new UnauthorizedException("Invalid refresh token");


    const newRefresh = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET_REFRESH
    });

    const hashed = await bcrypt.hash(newRefresh, 10);


    await this.userService.update(user.id, { refresh_token: hashed });

    try {
      await this.redis.set(`refresh_token:${user.id}`, hashed);
    } catch (e) {
      console.warn("⚠ Redis unavailable — skip caching");
    }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: newRefresh
    };
  }
  async logout(userId: number) {

    await this.redis.del(`refresh_token:${userId}`);
    await this.userService.update(userId, { refresh_token: null });
  }

}





