import { GameModeEnum } from "src/enums/game-mode.enum";
import { User } from "../entities/user.entity";
import { GameTypeEnum } from "src/enums/game-type.enum";
import { GameSpeedEnum } from "src/enums/game-speed.enum";

export class CreateMatchResultDto {
    user: User;
    opponentUser: User;
    myScore: number;
    opponentScore: number;
    gameType: GameTypeEnum;
    gameMode: GameModeEnum;
    gameSpeed: GameSpeedEnum;
    lpChange: number;
}