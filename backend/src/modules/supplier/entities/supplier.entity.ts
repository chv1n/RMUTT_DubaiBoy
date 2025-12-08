import { MaterialInventory } from '../../material-inventory/entities/material-inventory.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('supplier')
export class Supplier {
    @PrimaryGeneratedColumn({ name: 'supplier_id' })
    supplier_id: number;

    @Column({ name: 'supplier_name', type: 'varchar', nullable: true })
    supplier_name: string;

    @Column({ name: 'phone', type: 'varchar', nullable: true })
    phone: string;

    @OneToMany(() => MaterialInventory, (inventory) => inventory.supplier)
    materialInventory: MaterialInventory[];

    @Column({ name: 'email', type: 'varchar', nullable: true })
    email: string;

    @Column({ name: 'address', type: 'varchar', nullable: true })
    address: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @UpdateDateColumn({ name: 'update_date', nullable: true })
    update_date: Date;
}
