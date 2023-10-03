import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

export enum GameType {
    LADDER = 'ladder',
    NORMAL = 'normal'
}

@Entity()
export class MatchHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    participantUserId: number;

    @Column()
    opponentUserId: number;
    
    @ManyToOne(() => User, user => user.participatedMatches)
    @JoinColumn({ name: 'participantUserId' })
    participantUser: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'opponentUserId' })
    opponentUser: User;

    @Column()
    myScore: number;

    @Column()
    opponentScore: number;

    @Column({
        type: 'enum',
        enum: GameType,
    })
    gameType: GameType;

    @Column()
    lpChange: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'})
    playedAt: Date; 
}