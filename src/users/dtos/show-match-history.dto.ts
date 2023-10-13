import { GameTypeEnum } from "src/enums/game-type.enum";

export class ShowMatchHistoryDto {
    playedAt: Date;
    opponentNickname: string;
    gameType: GameTypeEnum;
    myScore: number;
    opponentScore: number;
    outcome: string;
    lpChange: number;
}