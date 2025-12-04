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
    user_name: string;

    @Column({ nullable: true })
    full_name: string;

    @Column({ type: 'text', nullable: true })
    pass_word: string;

    @Column({ default: 'user' })
    role: string;



    @Column({ default: true })
    active: boolean;

    @Column({ type: 'text', nullable: true })
    refresh_token: string | null;

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
        if (this.pass_word) {
            this.pass_word = await bcrypt.hash(this.pass_word, 10);
        }
    }

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
