import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user_id: number;

    @Column({ nullable: true })
    username: string;

    @Column({ type: 'enum', enum: AuditAction })
    action: AuditAction;

    @Column({ type: 'enum', enum: AuditEntity })
    entity_type: AuditEntity;

    @Column({ nullable: true })
    entity_id: string;

    @Column({ type: 'jsonb', nullable: true })
    old_values: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    new_values: Record<string, any>;

    @CreateDateColumn()
    created_at: Date;
}
