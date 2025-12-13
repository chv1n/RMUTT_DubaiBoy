import { Controller, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { Role } from 'src/common/enums';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller('audit-logs')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }


    @Auth(Role.SUPER_ADMIN)
    @Get()
    findAll(@Query() query: AuditQueryDto) {
        return this.auditLogService.findAll(query);
    }

    @Auth(Role.SUPER_ADMIN)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.auditLogService.findOne(id);
    }
}
