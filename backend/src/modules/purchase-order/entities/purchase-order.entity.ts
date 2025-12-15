import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    DELAYED = 'DELAYED' // System can auto-flag this if current date > expected
}

@Entity('purchase_order')
export class PurchaseOrder {
    @PrimaryGeneratedColumn({ name: 'po_id' })
    po_id: number;

    @Column({ name: 'po_number', unique: true })
    po_number: string;

    @Column({ name: 'supplier_id' })
    supplier_id: number;

    @ManyToOne(() => Supplier)
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @Column({ name: 'order_date', type: 'timestamp' })
    order_date: Date;

    @Column({ name: 'expected_delivery_date', type: 'timestamp' })
    expected_delivery_date: Date;

    @Column({ name: 'actual_delivery_date', type: 'timestamp', nullable: true })
    actual_delivery_date: Date;

    @Column({
        type: 'enum',
        enum: PurchaseOrderStatus,
        default: PurchaseOrderStatus.PENDING
    })
    status: PurchaseOrderStatus;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    total_amount: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => PurchaseOrderItem, item => item.purchase_order, { cascade: true })
    items: PurchaseOrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
