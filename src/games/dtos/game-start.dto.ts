import { Expose } from 'class-transformer';
import { GamePlayerDto } from './game-player.dto';
import { GameBallDto } from './game-ball.dto';

export class GameStartDto {
  @Expose()
  canvasWidth: number;
  @Expose()
  canvasHeight: number;
  @Expose()
  paddleWidth: number;
  @Expose()
  paddleHeight: number;
  @Expose()
  me: GamePlayerDto;
  @Expose()
  oppense: GamePlayerDto;
  @Expose()
  ball: GameBallDto;
}
