import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Notification {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;
    
    @Column()
    isRead: boolean;
}