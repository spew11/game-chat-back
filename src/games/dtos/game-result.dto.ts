import { Expose } from 'class-transformer';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';
import { MatchResult } from 'src/users/enums/match-result.enum';

export class GameResultDto {
  @Expose()
  lpChange: number;

  @Expose()
  user: ShowUserOverviewDto;

  @Expose()
  userScore: number;

  @Expose()
  opponentScore: number;

  @Expose()
  result: MatchResult;
}
