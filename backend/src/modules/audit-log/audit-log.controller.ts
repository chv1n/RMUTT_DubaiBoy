import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@Controller('audit-logs')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    findAll(@Query() query: AuditQueryDto) {
        return this.auditLogService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.auditLogService.findOne(id);
    }
}
