import { Expose } from 'class-transformer';
import { ShowUserOverviewDto } from './show-user-overview.dto';
import { MatchResult } from '../enums/match-result.enum';
import { gameType } from 'src/games/enums/game-type.enum';
import { GameMode } from 'src/games/enums/game-mode.enum';

export class MatchHistoryDto {
  @Expose()
  id: number;

  @Expose()
  opponent: ShowUserOverviewDto;

  @Expose()
  result: MatchResult;

  @Expose()
  userScore: number;

  @Expose()
  opponentScore: number;

  @Expose()
  lpChange: number;

  @Expose()
  mode: GameMode;

  @Expose()
  type: gameType;

  @Expose()
  playedAt: Date;
}
