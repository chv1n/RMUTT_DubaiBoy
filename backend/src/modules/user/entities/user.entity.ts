import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';


@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    fullname: string;

    @Column({ type: 'text' })
    @Exclude()
    password: string;

    @Column({ default: 'user' })
    role: string;



    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'text', nullable: true })
    @Exclude()
    refresh_token: string | null;

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    @BeforeUpdate()
    async hashPasswordBeforeUpdate() {

        if (this.password && !this.password.startsWith('$2b$')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    @Exclude()
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;
}
