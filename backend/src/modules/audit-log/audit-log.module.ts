import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogSubscriber } from './subscribers/audit-log.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditLogController],
    providers: [AuditLogService, AuditLogSubscriber],
    exports: [AuditLogService],
})
export class AuditLogModule { }
