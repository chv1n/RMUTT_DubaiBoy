import { Module } from '@nestjs/common';
import { PushLogService } from './push-log.service';
import { PushLogController } from './push-log.controller';

@Module({
  controllers: [PushLogController],
  providers: [PushLogService],
})
export class PushLogModule {}
