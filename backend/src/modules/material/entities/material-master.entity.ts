import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, OneToMany, DeleteDateColumn, OneToOne } from 'typeorm';
import { MaterialGroup } from '../../material-group/entities/material-group.entity';
import { MaterialContainerType } from '../../container-type/entities/container-type.entity';
import { MaterialUnits } from '../../unit/entities/unit.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { Bom } from 'src/modules/bom/entities/bom.entity';
import { MaterialInventory } from 'src/modules/material-inventory/entities/material-inventory.entity';

@Entity('material_master')
export class MaterialMaster {
    @PrimaryGeneratedColumn({ name: 'material_id' })
    material_id: number;

    @Column({ name: 'material_group_id', nullable: true })
    material_group_id: number;

    @ManyToOne(() => MaterialGroup)
    @JoinColumn({ name: 'material_group_id' })
    material_group: MaterialGroup;

    @OneToMany(() => Bom, (bom) => bom.material)
    boms: Bom[];

    @OneToMany(() => MaterialInventory, (inventory) => inventory.material)
    materialInventory: MaterialInventory[];

    @Column({ name: 'material_name', type: 'varchar' })
    material_name: string;

    @Column({ name: 'order_leadtime', type: 'int', nullable: true })
    order_leadtime: number;

    @Column({ name: 'container_type_id', nullable: true })
    container_type_id: number;

    @ManyToOne(() => MaterialContainerType)
    @JoinColumn({ name: 'container_type_id' })
    container_type: MaterialContainerType;

    @Column({ name: 'quantity_per_container', type: 'int', nullable: true })
    quantity_per_container: number;

    @Column({ name: 'unit_id', nullable: true })
    unit_id: number;

    @ManyToOne(() => MaterialUnits)
    @JoinColumn({ name: 'unit_id' })
    unit: MaterialUnits;

    @Column({ name: 'container_min_stock', type: 'int', nullable: true })
    container_min_stock: number;

    @Column({ name: 'container_max_stock', type: 'int', nullable: true })
    container_max_stock: number;

    @Column({ name: 'lifetime', type: 'int', nullable: true })
    lifetime: number;

    @Column({ name: 'lifetime_unit', type: 'varchar', nullable: true })
    lifetime_unit: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @UpdateDateColumn({ name: 'update_date' })
    update_date: Date;

    @Column({ name: 'cost_per_unit', type: 'float', nullable: true })
    cost_per_unit: number;

    @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
    expiration_date: Date;

    @Column({ name: 'supplier_id', nullable: true })
    supplier_id: number;

    @ManyToOne(() => Supplier)
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}
