
import { Product } from '../../product/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, DeleteDateColumn, OneToMany, Unique, CreateDateColumn } from 'typeorm';


@Entity('product-type')
export class ProductType {
    @PrimaryGeneratedColumn({ name: 'product_type_id' })
    product_type_id: number;


    @Unique(['type_name'])
    @Column({ name: 'type_name', type: 'varchar', nullable: false })
    type_name: string;



    @OneToMany(() => Product, (product) => product.product_type)
    products: Product[];

    @Column({ name: 'active', type: 'int', nullable: true, default: 1 })
    active: number;

    @CreateDateColumn({ name: 'create_date', nullable: true })
    create_date: Date;


    @UpdateDateColumn({ name: 'update_date', nullable: true })
    update_date: Date;

    @DeleteDateColumn({ name: 'deleted_at', select: false })
    deleted_at: Date;

}
