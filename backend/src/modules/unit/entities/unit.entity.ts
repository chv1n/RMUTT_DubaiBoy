import { Bom } from 'src/modules/bom/entities/bom.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';

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

    @DeleteDateColumn({ name: 'deleted_at', select: false })
    deleted_at: Date;
}
