import { Inject, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../audit-log/enums/audit-action.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('REDIS') private redis: Redis,
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private auditLogService: AuditLogService,
  ) { }

  async validate(user_name: string, pass_word: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { username: user_name } });
    if (user && (await bcrypt.compare(pass_word, user.password))) {
      return { ...user };
    }
    await this.auditLogService.logSecurityEvent({
      username: user_name,
      action: AuditAction.LOGIN_FAILED,
    });
    return null;
  }

  async login(user: any) {
    await this.auditLogService.logSecurityEvent({
      userId: user.id,
      username: user.username,
      action: AuditAction.LOGIN_SUCCESS,
    });

    const payload = { ...user };

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
      this.logger.warn(err);
    }

    try {
      await this.redis.set(
        `refresh_token:${user.id}`,
        hashedRefreshToken,
        'EX',
        60 * 60 * 24 * 7
      );
    } catch (err) {
      this.logger.warn(err);
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
      this.logger.warn("Redis unavailable — fallback to DB");
    }

    if (!storedHash) {
      const userFromDb = await this.userRepo.findOne({ where: { id: user.id } });
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
      this.logger.warn("⚠ Redis unavailable — skip caching");
    }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: newRefresh
    };
  }

  async logout(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    await this.auditLogService.logSecurityEvent({
      userId,
      username: user?.username || 'unknown',
      action: AuditAction.LOGOUT,
    });
    await this.redis.del(`refresh_token:${userId}`);
    await this.userService.update(userId, { refresh_token: null });
  }
}





