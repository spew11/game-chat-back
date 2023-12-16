import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { GamesGateway } from './games.gateway';
import { RedisService } from 'src/commons/redis-client.service';
import { GameMode } from './enums/game-mode.enum';
import { gameType } from './enums/game-type.enum';
import { GameModeDto } from './dtos/game-mode.dto';
import { SocketConnectionGateway } from 'src/socket-connection/socket-connection.gateway';
import { UserStatus } from 'src/users/enums/user-status.enum';

type Wating = {
  [GameMode.STANDARD]: number | null;
  [GameMode.EXTREME]: number | null;
};

@UseGuards(AuthGuard)
@Controller('games')
export class GamesController {
  private wating: Wating = {
    [GameMode.STANDARD]: null,
    [GameMode.EXTREME]: null,
  };

  constructor(
    private gamesGateway: GamesGateway,
    private redisService: RedisService,
    private socketConnectionGateway: SocketConnectionGateway,
  ) {}

  // 매칭 방식은 추후에 queue를 이용하는것으로 변경
  @Post('queue')
  async joinGameQueue(@GetUser() user: User, @Body() { mode }: GameModeDto) {
    const userStatus = await this.socketConnectionGateway.getUserStatus(user.id);
    if (userStatus === UserStatus.INGAME) {
      throw new BadRequestException('이미 게임에 참여하고 있습니다.');
    }

    const watingUserId = this.wating[mode];
    if (!watingUserId || watingUserId === user.id) {
      this.wating[mode] = user.id;
      return;
    }

    const userId1 = watingUserId;
    const userId2 = user.id;
    this.wating[mode] = null;

    return this.gamesGateway.initGame(userId1, userId2, mode, gameType.LADDER);
  }

  @Delete('queue')
  cancelGameQueue(@GetUser() user: User) {
    if (this.wating.extreme === user.id) this.wating.extreme = null;
    else if (this.wating.standard === user.id) this.wating.standard = null;
    else throw new BadRequestException('등록하지않은 큐를 취소할 수 없습니다.');
  }

  @Post('invite/:user_id')
  async inviteGame(
    @GetUser() user: User,
    @Param('user_id') invitedUserId: number,
    @Body() { mode }: GameModeDto,
  ) {
    const key = `game_invite:${user.id}-${invitedUserId}`;
    const value = mode;
    const duration = 3 * 60; // 3분

    await this.redisService.setex(key, duration, value);
    this.gamesGateway.notiGameInvite(invitedUserId, user, mode);
  }

  @Post('accept/:user_id')
  async inviteGameAccept(@GetUser() user: User, @Param('user_id') invitingUserId: number) {
    const key = `game_invite:${invitingUserId}-${user.id}`;

    const mode = (await this.redisService.getdel(key)) as GameMode;
    if (!mode) {
      throw new NotFoundException('없거나 만료된 초대입니다.');
    }

    const invitingUserStatus = await this.socketConnectionGateway.getUserStatus(invitingUserId);
    const invitedUserStatus = await this.socketConnectionGateway.getUserStatus(user.id);
    if (invitingUserStatus === UserStatus.INGAME || invitedUserStatus === UserStatus.INGAME) {
      throw new BadRequestException('이미 게임에 참여하고 있습니다.');
    }

    return this.gamesGateway.initGame(invitingUserId, user.id, mode, gameType.FRIENDLY);
  }

  @Delete('reject/:user_id')
  inviteGameReject(@GetUser() user: User, @Param('user_id') invitingUserId: number) {
    const key = `game_invite:${invitingUserId}-${user.id}`;

    return this.redisService.getdel(key);
  }
}
