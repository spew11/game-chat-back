import { User } from 'src/users/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MatchResult } from './enums/match-result.enum';

@Entity()
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
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

  // type:

  // speed

  @CreateDateColumn()
  playedAt: Date;
}
