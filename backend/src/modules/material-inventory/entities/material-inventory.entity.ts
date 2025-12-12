import { InventoryTransaction } from "src/modules/inventory-transaction/entities/inventory-transaction.entity";
import { MaterialMaster } from "src/modules/material/entities/material-master.entity";
import { WarehouseMaster } from "src/modules/warehouse-master/entities/warehouse-master.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne } from "typeorm";


@Entity('material_inventory')
export class MaterialInventory {

    @PrimaryGeneratedColumn({ name: 'inventory_id' })
    id: number;

    @ManyToOne(() => MaterialMaster, (mm) => mm.materialInventory)
    @JoinColumn({ name: 'material_id' })
    material: MaterialMaster;

    @ManyToOne(() => WarehouseMaster, (wh) => wh.materialInventory)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: WarehouseMaster

    @OneToMany(() => InventoryTransaction, (trx) => trx.materialInventory)
    inventoryTransactions: InventoryTransaction[];


    @Column({ name: 'quantity', type: 'int', nullable: false })
    quantity: number;

    @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
    reserved_quantity: number;

    @Column({ name: 'order_number', type: 'varchar', nullable: true })
    order_number: string;

    @Column({ name: 'mfg_date', type: 'timestamp', nullable: true })
    mfg_date: Date;

    @Column({ name: 'exp_date', type: 'timestamp', nullable: true })
    exp_date: Date;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}
