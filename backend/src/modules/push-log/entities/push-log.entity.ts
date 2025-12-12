import { PushSubscription } from "src/modules/push-subscription/entities/push-subscription.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('push_log')
export class PushLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PushSubscription, (subscription) => subscription.push_logs)
    @JoinColumn({ name: 'subscription_id' })
    subscription: PushSubscription;

    @Column({ name: 'subscription_id' })
    subscription_id: number;

    @Column({ nullable: true })
    user_id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'json', nullable: true })
    payload_json: any;

    @Column({ type: 'varchar', length: 20 })
    status: string;

    @Column({ type: 'text', nullable: true })
    error_message: string;

    @CreateDateColumn()
    sent_at: Date;
}
