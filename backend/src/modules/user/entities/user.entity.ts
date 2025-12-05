import * as bcrypt from 'bcrypt';

import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
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
    password: string;

    @Column({ default: 'user' })
    role: string;



    @Column({ default: true })
    active: boolean;

    @Column({ type: 'text', nullable: true })
    refresh_token: string | null;

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
