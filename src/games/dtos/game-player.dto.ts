import { Expose } from 'class-transformer';
import { GameBarDto } from './game-bar.dto';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';

export class GamePlayerDto {
  @Expose()
  bar: GameBarDto;
  @Expose()
  score: number;
  @Expose()
  info: ShowUserOverviewDto;
}
