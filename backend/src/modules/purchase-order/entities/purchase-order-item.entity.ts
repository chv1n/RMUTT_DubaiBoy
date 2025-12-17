import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { MaterialMaster } from '../../material/entities/material-master.entity';

@Entity('purchase_order_item')
export class PurchaseOrderItem {
    @PrimaryGeneratedColumn({ name: 'po_item_id' })
    po_item_id: number;

    @Column({ name: 'po_id' })
    po_id: number;

    @ManyToOne(() => PurchaseOrder, po => po.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'po_id' })
    purchase_order: PurchaseOrder;

    @Column({ name: 'material_id' })
    material_id: number;

    @ManyToOne(() => MaterialMaster)
    @JoinColumn({ name: 'material_id' })
    material: MaterialMaster;

    @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unit_price: number;

    @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;
}
