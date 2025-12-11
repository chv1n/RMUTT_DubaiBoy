import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction } from './enums/audit-action.enum';
import { AuditEntity } from './enums/audit-entity.enum';
import { AuditQueryDto } from './dto/audit-query.dto';
import { QueryHelper } from 'src/common/helpers/query.helper';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditRepository: Repository<AuditLog>,
    ) { }

    async logDataChange(params: {
        userId?: number;
        username?: string;
        action: AuditAction;
        entityType: AuditEntity;
        entityId: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
    }): Promise<void> {
        const log = this.auditRepository.create({
            user_id: params.userId,
            username: params.username,
            action: params.action,
            entity_type: params.entityType,
            entity_id: params.entityId,
            old_values: params.oldValues,
            new_values: params.newValues,
        });
        await this.auditRepository.save(log);
    }

    async logSecurityEvent(params: {
        userId?: number;
        username: string;
        action: AuditAction;
        details?: Record<string, any>;
    }): Promise<void> {
        const log = this.auditRepository.create({
            user_id: params.userId,
            username: params.username,
            action: params.action,
            entity_type: AuditEntity.AUTH,
            new_values: params.details,
        });
        await this.auditRepository.save(log);
    }

    async findAll(query: AuditQueryDto) {
        const where: any = {};

        if (query.action) where.action = query.action;
        if (query.entity_type) where.entity_type = query.entity_type;
        if (query.entity_id) where.entity_id = query.entity_id;
        if (query.user_id) where.user_id = query.user_id;

        if (query.start_date && query.end_date) {
            where.created_at = Between(new Date(query.start_date), new Date(query.end_date));
        } else if (query.start_date) {
            where.created_at = MoreThanOrEqual(new Date(query.start_date));
        } else if (query.end_date) {
            where.created_at = LessThanOrEqual(new Date(query.end_date));
        }

        return QueryHelper.paginate(this.auditRepository, query, {
            where,
            sortField: 'created_at',
        });
    }

    async findOne(id: number) {
        return this.auditRepository.findOne({ where: { id } });
    }
}
