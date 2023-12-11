import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SocketConnectionGateway } from 'src/socket-connection/socket-connection.gateway';
import { Match } from './game/games.match';
import { GameMode } from './enums/game-mode.enum';
import { gameType } from './enums/game-type.enum';
import { GameStatus } from './enums/game-status.enum';
import { Player } from './game/games.player';

@Injectable()
export class GamesService {
  readonly matches = new Map<Match, Match>();
  readonly playingSockets = new Map<string, { player: Player; match: Match }>();

  constructor(private socketConnectionGateway: SocketConnectionGateway) {}

  createMatch(mode: GameMode, type: gameType) {
    return new Match(mode, type);
  }

  async initMatch(match: Match, userId1: number, userId2: number) {
    const socketId1 = (await this.socketConnectionGateway.userToSocket(userId1)).id;
    const socketId2 = (await this.socketConnectionGateway.userToSocket(userId2)).id;
    if (!(socketId1 || socketId2)) throw new NotFoundException('socket을 찾을 수 없습니다.');

    match.init(userId1, socketId1, userId2, socketId2);
  }

  startMatch(match: Match) {
    if (match.status !== GameStatus.READY) {
      throw new InternalServerErrorException('잘못된 게임입니다.');
    }

    this.matches.set(match, match);
    this.playingSockets.set(match.player1.socketId, { player: match.player1, match });
    this.playingSockets.set(match.player2.socketId, { player: match.player2, match });

    // 3초 후 게임 시작
    setTimeout(() => (match.status = GameStatus.PROGRESS), 3000);
  }

  progressMatch(match: Match) {
    match.moveBar();
    match.mode === GameMode.STANDARD ? match.moveBall() : match.moveBallExtreme();
  }

  giveUpMatch(socketId: string) {
    const player = this.playingSockets.get(socketId)?.player;
    const match = this.playingSockets.get(socketId)?.match;
    if (!(player || match)) {
      return;
    }

    const { me, oppense } =
      player === match.player1
        ? { me: match.player1, oppense: match.player2 }
        : { me: match.player2, oppense: match.player1 };
    me.score = 0;
    oppense.score = 3;
    match.status = GameStatus.FINISH;
  }

  endMatch(match: Match) {
    this.playingSockets.delete(match.player1.socketId);
    this.playingSockets.delete(match.player2.socketId);
    this.matches.delete(match);
  }

  socketToPlayer(socketId: string) {
    return this.playingSockets.get(socketId)?.player;
  }
}
