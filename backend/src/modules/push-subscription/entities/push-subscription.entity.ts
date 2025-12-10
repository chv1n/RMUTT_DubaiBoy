import { Exclude } from "class-transformer";
import { PushLog } from "src/modules/push-log/entities/push-log.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";

@Entity('push_subscription')
export class PushSubscription {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'endpoint', type: 'varchar', length: 255 })
    endpoint: string;

    @Exclude()
    @ManyToOne(() => User, (user) => user.pushSubscriptions)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => PushLog, (pushLog) => pushLog.subscription)
    push_logs: PushLog[];

    @Column()
    user_id: number;

    @Column({ name: 'p256dh', type: 'json' })
    p256dh: any;

    @Column({ name: 'auth', type: 'json' })
    auth: any;


    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deleted_at: Date;
}