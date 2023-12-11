import { Expose } from 'class-transformer';

export class GameBallDto {
  @Expose()
  x: number;
  @Expose()
  y: number;
  @Expose()
  radius: number;
}
