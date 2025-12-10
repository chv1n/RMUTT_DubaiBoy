import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';
import { PlanList } from 'src/modules/plan-list/entities/plan-list.entity';

@Entity('product_plan')
export class ProductPlan {
    @PrimaryGeneratedColumn({ name: 'plan_id' })
    id: number;

    @ManyToOne(() => Product, (product) => product.product_plan)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'product_id' })
    product_id: number;

    @OneToMany(() => PlanList, (plan_list) => plan_list.plan_id)
    plan_list: PlanList[];

    @Column({ name: 'input_quantity', type: 'int', nullable: true })
    input_quantity: number;

    @Column({ name: 'plan_name', type: 'varchar', nullable: true })
    plan_name: string;

    @Column({ name: 'plan_description', type: 'text', nullable: true })
    plan_description: string;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    start_date: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    end_date: Date;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}
