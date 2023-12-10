import { Expose } from 'class-transformer';

export class GameBarDto {
  @Expose()
  x: number;
  @Expose()
  y: number;
  @Expose()
  width: number;
  @Expose()
  height: number;
}
