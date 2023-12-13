import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { SocketConnectionGateway } from 'src/socket-connection/socket-connection.gateway';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user: User;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly socketConnectionGateway: SocketConnectionGateway,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const userId = request?.session.userId;
    if (!userId) throw new UnauthorizedException('로그인이 필요합니다.');

    const socketSessionId = await this.socketConnectionGateway.getSessionIdByUser(userId);
    if (!(socketSessionId && socketSessionId === request.sessionID)) {
      throw new UnauthorizedException('소켓이 연결되지 않았습니다.');
    }

    const user: User = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('유효하지 않은 사용자입니다.');

    request.user = user;

    return true;
  }
}
