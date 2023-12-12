import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import { NotFoundException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { UsersService } from 'src/users/users.service';
import { GameMode } from './enums/game-mode.enum';
import { gameType } from './enums/game-type.enum';
import { GamesService } from './games.service';
import { gameSetting } from './game/games.setting';
import { Match } from './game/games.match';
import { MatchHistory } from 'src/users/entities/match-history.entity';
import { GameStatus } from './enums/game-status.enum';
import { dtoSerializer } from 'src/utils/dtoSerializer.util';
import { GameInfoDto } from './dtos/game-info.dto';
import { GameResultDto } from './dtos/game-result.dto';
import { GameStartDto } from './dtos/game-start.dto';
import { SocketRoomPrefix } from 'src/socket-connection/enums/socket-room-prefix.enum';
import { NotiGameInviteDto } from 'src/notifications/dtos/noti-game-invite.dto';
import { RedisService } from 'src/commons/redis-client.service';
import { RedisFieldPrefix, RedisKey } from 'src/commons/enums/redis.enum';
import { UserStatus } from 'src/users/enums/user-status.enum';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class GamesGateway {
  @WebSocketServer() server: Server;

  constructor(
    private gamesService: GamesService,
    private usersService: UsersService,
    private redisService: RedisService,
  ) {
    setInterval(() => {
      gamesService.matches.forEach((match) => {
        if (match.status === GameStatus.PROGRESS) {
          this.gamesService.progressMatch(match);
          this.emitGameInfo(match);
        } else if (match.status === GameStatus.FINISH) {
          this.usersService
            .saveMatchHistory(match)
            .then((matchHistorys) => {
              this.emitGameResult(match.player1.socketId, matchHistorys[0]);
              this.emitGameResult(match.player2.socketId, matchHistorys[1]);
            })
            .catch((e) => console.log(e));

          this.gamesService.endMatch(match);
          this.redisService
            .hget(RedisKey.USER_STATUS, RedisFieldPrefix.USER_ID + match.player1.userId)
            .then((status) => {
              if (status) {
                this.redisService.hset(
                  RedisKey.USER_STATUS,
                  RedisFieldPrefix.USER_ID + match.player1.userId,
                  UserStatus.ONLINE,
                );
              }
            });
          this.redisService
            .hget(RedisKey.USER_STATUS, RedisFieldPrefix.USER_ID + match.player2.userId)
            .then((status) => {
              if (status) {
                this.redisService.hset(
                  RedisKey.USER_STATUS,
                  RedisFieldPrefix.USER_ID + match.player2.userId,
                  UserStatus.ONLINE,
                );
              }
            });
        }
      });
    }, 10);
  }

  handleDisconnect(clientSocket: Socket): void {
    const player = this.gamesService.socketToPlayer(clientSocket.id);
    if (player) {
      this.gamesService.giveUpMatch(clientSocket.id);
    }
  }

  async initGame(userId1: number, userId2: number, mode: GameMode, type: gameType) {
    const user1 = await this.usersService.findById(userId1);
    const user2 = await this.usersService.findById(userId2);
    if (!(user1 || user2)) throw new NotFoundException('user를 찾을 수 없습니다.');

    const match = this.gamesService.createMatch(mode, type);
    await this.gamesService.initMatch(match, userId1, userId2);
    this.gamesService.startMatch(match);

    await this.redisService.hset(
      RedisKey.USER_STATUS,
      RedisFieldPrefix.USER_ID + userId1,
      UserStatus.INGAME,
    );
    await this.redisService.hset(
      RedisKey.USER_STATUS,
      RedisFieldPrefix.USER_ID + userId2,
      UserStatus.INGAME,
    );
    this.emitGameStart(match, user1, user2);
  }

  emitGameStart(match: Match, user1: User, user2: User) {
    const gameStartDtoByP1 = dtoSerializer(GameStartDto, {
      ...gameSetting,
      me: { ...match.player1, info: user1 },
      opponent: { ...match.player2, info: user2 },
      ball: match.ball,
    });
    this.server.to(match.player1.socketId).emit('game-start', gameStartDtoByP1);

    const { playerReverse1, playerReverse2, ballReverse } = match.reverse();
    const gameStartDtoByP2 = dtoSerializer(GameStartDto, {
      ...gameSetting,
      me: { ...playerReverse2, info: user2 },
      opponent: { ...playerReverse1, info: user1 },
      ball: ballReverse,
    });
    this.server.to(match.player2.socketId).emit('game-start', gameStartDtoByP2);
  }

  emitGameInfo(match: Match) {
    const gameInfoDtoByP1 = dtoSerializer(GameInfoDto, {
      me: match.player1,
      opponent: match.player2,
      ball: match.ball,
    });
    this.server.to(match.player1.socketId).emit('game-info', gameInfoDtoByP1);

    const { playerReverse1, playerReverse2, ballReverse } = match.reverse();
    const gameInfoDtoByP2 = dtoSerializer(GameInfoDto, {
      me: playerReverse2,
      opponent: playerReverse1,
      ball: ballReverse,
    });
    this.server.to(match.player2.socketId).emit('game-info', gameInfoDtoByP2);
  }

  emitGameResult(socketId: string, matchHistory: MatchHistory) {
    const gameResultDto = dtoSerializer(GameResultDto, matchHistory);
    this.server.to(socketId).emit('game-result', gameResultDto);
  }

  @SubscribeMessage('move-bar')
  gamePaddleMove(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() event: { type: string; key: string },
  ) {
    const player = this.gamesService.socketToPlayer(clientSocket.id);
    if (!player) throw new NotFoundException('socket을 찾을 수 없습니다.');

    if (event.type === 'keydown') {
      if (event.key === 'ArrowLeft') player.moveLeft();
      else if (event.key === 'ArrowRight') player.moveRight();
    } else if (event.type === 'keyup') {
      if (event.key === 'ArrowLeft') player.moveStop();
      else if (event.key === 'ArrowRight') player.moveStop();
    }
  }

  notiGameInvite(invitedUserId: number, invitingUser: User, mode: GameMode) {
    const noti = dtoSerializer(NotiGameInviteDto, {
      invitingUser,
      mode,
    });
    // prettier-ignore
    this.server
      .to(SocketRoomPrefix.USER_ID + invitedUserId.toString())
      .emit('noti', noti);
  }
}
