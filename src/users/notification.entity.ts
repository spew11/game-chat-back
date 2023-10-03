import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class notification extends BaseEntity {
    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn( {name: 'userId'} )
    user: User;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;
}