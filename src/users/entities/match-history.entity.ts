import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { GameTypeEnum } from "src/enums/game-type.enum";
import { GameModeEnum } from "src/enums/game-mode.enum";
import { GameSpeedEnum } from "src/enums/game-speed.enum";

@Entity()
export class MatchHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    // @ManyToOne(() => User, user => user.participatedMatches)
    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'opponentId' })
    opponentUser: User;

    @Column()
    myScore: number;

    @Column()
    opponentScore: number;

    @Column({
        type: 'enum',
        enum: GameTypeEnum,
        // type: 'text',  // sqlite에서 enum타입 지원안해서 임시 방편 사용
    })
    gameType: GameTypeEnum;

    @Column({
        type: 'enum',
        enum: GameModeEnum,
        // type: 'text'
    })
    gameMode: GameModeEnum;

    @Column({
        type: 'enum',
        enum: GameSpeedEnum,
        // type: 'text'
    })
    gameSpeed: GameSpeedEnum

    @Column()
    lpChange: number;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'}) // postgresql 용
    // @Column('datetime', { default: () => 'CURRENT_TIMESTAMP'})
    playedAt: Date; 
}