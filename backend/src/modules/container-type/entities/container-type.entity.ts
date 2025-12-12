import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('material_container_type')
export class MaterialContainerType {
    @PrimaryGeneratedColumn({ name: 'type_id' })
    type_id: number;

    @Column({ name: 'type_name', type: 'varchar' })
    type_name: string;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}
