import { User } from './user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MatchResult } from '../enums/match-result.enum';
import { GameMode } from 'src/games/enums/game-mode.enum';
import { gameType } from 'src/games/enums/game-type.enum';

@Entity()
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.matchHistorys)
  user: User;

  @ManyToOne(() => User)
  opponent: User;

  @Column({
    type: 'enum',
    enum: MatchResult,
  })
  result: MatchResult;

  @Column()
  userScore: number;

  @Column()
  opponentScore: number;

  @Column()
  lpChange: number;

  @Column({
    type: 'enum',
    enum: GameMode,
  })
  mode: GameMode;

  @Column({
    type: 'enum',
    enum: gameType,
  })
  type: gameType;

  @CreateDateColumn()
  playedAt: Date;
}
