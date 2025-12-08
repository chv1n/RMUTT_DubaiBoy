import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('material_group')
export class MaterialGroup {
    @PrimaryGeneratedColumn({ name: 'group_id' })
    group_id: number;

    @Column({ name: 'group_name', type: 'varchar' })
    group_name: string;

    @Column({ name: 'abbreviation', type: 'varchar' })
    abbreviation: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}
