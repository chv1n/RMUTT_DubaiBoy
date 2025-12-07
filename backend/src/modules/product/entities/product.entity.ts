
import { Bom } from 'src/modules/bom/entities/bom.entity';
import { ProductType } from '../../product-type/entities/product-type.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Unique, CreateDateColumn, OneToMany } from 'typeorm';


@Entity('product')
export class Product {
    @PrimaryGeneratedColumn({ name: 'product_id' })
    product_id: number;

    @Unique(['product_name'])
    @Column({ name: 'product_name', type: 'varchar', nullable: false })
    product_name: string;

    @OneToMany(() => Bom, (bom) => bom.product)
    boms: Bom[];

    @Column({ name: 'product_type_id', nullable: true })
    product_type_id: number;

    @ManyToOne(() => ProductType, (product_type) => product_type.products)
    @JoinColumn({ name: 'product_type_id' })
    product_type: ProductType;

    @Column({ name: 'active', type: 'int', nullable: true, default: 1 })
    active: number;

    @CreateDateColumn({ name: 'create_date', nullable: true })
    create_date: Date;

    @UpdateDateColumn({ name: 'update_date', nullable: true })
    update_date: Date;

    @DeleteDateColumn({ name: 'deleted_at', select: false })
    deleted_at: Date;
}
