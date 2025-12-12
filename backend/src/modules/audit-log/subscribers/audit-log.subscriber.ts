import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    SoftRemoveEvent,
    RecoverEvent,
    DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';
import { MaterialMaster } from 'src/modules/material/entities/material-master.entity';
import { Supplier } from 'src/modules/supplier/entities/supplier.entity';
import { WarehouseMaster } from 'src/modules/warehouse-master/entities/warehouse-master.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Bom } from 'src/modules/bom/entities/bom.entity';
import { ProductPlan } from 'src/modules/product-plan/entities/product-plan.entity';

@Injectable()
@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface {
    private auditableEntities = new Map<Function, AuditEntity>([
        [MaterialMaster, AuditEntity.MATERIAL],
        [Supplier, AuditEntity.SUPPLIER],
        [WarehouseMaster, AuditEntity.WAREHOUSE],
        [User, AuditEntity.USER],
        [Bom, AuditEntity.BOM],
        [ProductPlan, AuditEntity.PRODUCT_PLAN],
    ]);

    constructor(@InjectDataSource() private readonly dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    private getEntityType(entity: Function): AuditEntity | undefined {
        return this.auditableEntities.get(entity);
    }

    private getEntityId(entity: any): string {
        return String(entity.id || entity.material_id || entity.supplier_id || '');
    }

    private sanitizeEntity(entity: any): Record<string, any> {
        if (!entity) return {};
        const { password, refresh_token, ...rest } = entity;
        return rest;
    }

    async afterInsert(event: InsertEvent<any>): Promise<void> {
        const entityType = this.getEntityType(event.metadata.target as Function);
        if (!entityType) return;

        const auditLog = event.manager.create(AuditLog, {
            action: AuditAction.CREATE,
            entity_type: entityType,
            entity_id: this.getEntityId(event.entity),
            new_values: this.sanitizeEntity(event.entity),
        });

        await event.manager.save(AuditLog, auditLog);
    }

    async afterUpdate(event: UpdateEvent<any>): Promise<void> {
        const entityType = this.getEntityType(event.metadata.target as Function);
        if (!entityType) return;

        const auditLog = event.manager.create(AuditLog, {
            action: AuditAction.UPDATE,
            entity_type: entityType,
            entity_id: this.getEntityId(event.entity || event.databaseEntity),
            old_values: this.sanitizeEntity(event.databaseEntity),
            new_values: this.sanitizeEntity(event.entity),
        });

        await event.manager.save(AuditLog, auditLog);
    }

    async afterSoftRemove(event: SoftRemoveEvent<any>): Promise<void> {
        const entityType = this.getEntityType(event.metadata.target as Function);
        if (!entityType) return;

        const auditLog = event.manager.create(AuditLog, {
            action: AuditAction.DELETE,
            entity_type: entityType,
            entity_id: this.getEntityId(event.entity || event.databaseEntity),
            old_values: this.sanitizeEntity(event.databaseEntity),
        });

        await event.manager.save(AuditLog, auditLog);
    }

    async afterRecover(event: RecoverEvent<any>): Promise<void> {
        const entityType = this.getEntityType(event.metadata.target as Function);
        if (!entityType) return;

        const auditLog = event.manager.create(AuditLog, {
            action: AuditAction.RESTORE,
            entity_type: entityType,
            entity_id: this.getEntityId(event.entity || event.databaseEntity),
            new_values: this.sanitizeEntity(event.entity),
        });

        await event.manager.save(AuditLog, auditLog);
    }
}
