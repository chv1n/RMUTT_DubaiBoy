
import { Product } from '../../product/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, DeleteDateColumn, OneToMany, Unique, CreateDateColumn } from 'typeorm';


@Entity('product_type')
export class ProductType {
    @PrimaryGeneratedColumn({ name: 'product_type_id' })
    product_type_id: number;

    @Unique(['type_name'])
    @Column({ name: 'type_name', type: 'varchar', nullable: false })
    type_name: string;

    @OneToMany(() => Product, (product) => product.product_type)
    products: Product[];

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ name: 'create_at' })
    create_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at', select: false })
    deleted_at: Date;
}
