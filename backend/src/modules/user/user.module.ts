import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { UserDashboardController } from './controllers/user-dashboard.controller';
import { DashboardUserService } from './services/dashboard-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuditLog])],
  controllers: [UserController, UserDashboardController],
  providers: [UserService, DashboardUserService],
  exports: [UserService, DashboardUserService],
})
export class UserModule { }
