import { Bom } from 'src/modules/bom/entities/bom.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, DeleteDateColumn } from 'typeorm';

@Entity('material_units')
export class MaterialUnits {
    @PrimaryGeneratedColumn({ name: 'unit_id' })
    unit_id: number;


    @OneToMany(() => Bom, (bom) => bom.unit)
    boms: Bom[];

    @Column({ name: 'unit_name', type: 'varchar' })
    unit_name: string;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}
