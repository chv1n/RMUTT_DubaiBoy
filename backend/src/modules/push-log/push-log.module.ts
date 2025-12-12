import { Module } from '@nestjs/common';
import { PushLogService } from './push-log.service';
import { PushLogController } from './push-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushLog } from './entities/push-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushLog])],
  controllers: [PushLogController],
  providers: [PushLogService],
})
export class PushLogModule { }
