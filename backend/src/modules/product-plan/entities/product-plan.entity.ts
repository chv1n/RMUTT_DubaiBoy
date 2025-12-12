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
import { PlanStatusEnum } from '../enum/plan-status.enum';
import { PlanPriorityEnum } from '../enum/plan-priority.enum';
import { PlanMaterialAllocation } from './plan-material-allocation.entity';

@Entity('product_plan')
export class ProductPlan {
    @PrimaryGeneratedColumn({ name: 'plan_id' })
    id: number;

    @ManyToOne(() => Product, (product) => product.product_plan)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'product_id' })
    product_id: number;

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

    @Column({ name: 'plan_status', type: 'varchar', nullable: true, default: PlanStatusEnum.DRAFT })
    plan_status: string;

    @Column({ name: 'plan_priority', type: 'varchar', nullable: true, default: PlanPriorityEnum.LOW })
    plan_priority: string;

    // === New Tracking Fields ===

    @Column({ name: 'actual_produced_quantity', type: 'int', nullable: true })
    actual_produced_quantity: number;

    @Column({ name: 'estimated_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
    estimated_cost: number;

    @Column({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
    actual_cost: number;

    @Column({ name: 'started_at', type: 'timestamp', nullable: true })
    started_at: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completed_at: Date;

    @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
    cancelled_at: Date;

    @Column({ name: 'cancel_reason', type: 'text', nullable: true })
    cancel_reason: string;

    // === Relations ===

    @OneToMany(() => PlanMaterialAllocation, (allocation) => allocation.plan)
    material_allocations: PlanMaterialAllocation[];

    // === Timestamps ===

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}

