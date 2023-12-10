import { IsEnum } from 'class-validator';
import { GameMode } from '../enums/game-mode.enum';

export class GameModeDto {
  @IsEnum(GameMode)
  mode: GameMode;
}
