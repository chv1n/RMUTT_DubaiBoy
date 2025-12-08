
import { InventoryTransaction } from "src/modules/inventory-transaction/entities/inventory-transaction.entity"
import { MaterialInventory } from "src/modules/material-inventory/entities/material-inventory.entity"
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity("warehouse_master")
export class WarehouseMaster {

    @PrimaryGeneratedColumn({ name: 'warehouse_master_id' })
    id: number;

    @Column({ name: 'warehouse_name', nullable: true })
    warehosue_name: string;

    @OneToMany(() => InventoryTransaction, (inventoryTransaction) => inventoryTransaction.warehouse)
    inventoryTransactions: InventoryTransaction[];

    @OneToMany(() => MaterialInventory, (materialInventory) => materialInventory.warehouse)
    materialInventory: MaterialInventory[];

    @Column({ name: 'warehouse_code', nullable: true })
    warehouse_code: string;

    @Column({ name: 'warehouse_phone', nullable: true })
    warehouse_phone: string;

    @Column({ name: 'warehouse_address', nullable: true })
    warehouse_address: string;

    @Column({ name: 'warehouse_number', nullable: true, default: 1 })
    is_active: boolean;

    @DeleteDateColumn({ name: 'warehouse_deleted_at' })
    deleted_at: Date;

    @CreateDateColumn({ name: 'warehouse_created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'warehouse_updated_at' })
    updated_at: Date;
}
