import { Action } from "rxjs/internal/scheduler/Action";
import { Priority } from "src/common/enums/prority.enum";
import { Status } from "src/common/enums/status.enum";
import { ProductPlan } from "src/modules/product-plan/entities/product-plan.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";


@Entity('plan_list')
export class PlanList {
    @PrimaryGeneratedColumn({ name: 'plan_list_id' })
    id: number;


    @ManyToOne(() => ProductPlan, (plan) => plan.plan_list)
    @JoinColumn({ name: 'plan_id' })
    plan: ProductPlan;

    @Column({ name: 'plan_id' })
    plan_id: number;


    @Column({ name: 'priority', type: 'enum', enum: Priority, nullable: true })
    priority: Priority;

    @Column({ name: 'status', type: 'enum', enum: Status, nullable: true })
    status: Status;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}
