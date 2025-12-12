import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { MaterialInventory } from '../../material-inventory/entities/material-inventory.entity';
import { WarehouseMaster } from '../../warehouse-master/entities/warehouse-master.entity';


@Entity('inventory_transaction')
export class InventoryTransaction {
    @PrimaryGeneratedColumn({ name: 'inventory_transaction_id' })
    id: number;

    @ManyToOne(() => MaterialInventory, (mi) => mi.inventoryTransactions)
    @JoinColumn({ name: 'material_inventory_id' })
    materialInventory: MaterialInventory;

    @ManyToOne(() => WarehouseMaster, (warehouse) => warehouse.inventoryTransactions)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: WarehouseMaster;


    @Column()
    transaction_type: string;

    @Column()
    transaction_date: Date;

    @Column()
    quantity_change: number;

    @Column()
    reference_number: string;

    @Column()
    reason_remarks: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
