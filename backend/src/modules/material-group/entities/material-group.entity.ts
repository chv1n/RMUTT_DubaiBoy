import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('material_group')
export class MaterialGroup {
    @PrimaryGeneratedColumn({ name: 'group_id' })
    group_id: number;

    @Column({ name: 'group_name', type: 'varchar' })
    group_name: string;

    @Column({ name: 'abbreviation', type: 'varchar' })
    abbreviation: string;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @DeleteDateColumn({ name: 'delete_at' })
    delete_at: Date;

}
