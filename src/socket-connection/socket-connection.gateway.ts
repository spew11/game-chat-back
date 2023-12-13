import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { sessionMiddleware } from '@configs/session.config';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { RedisService } from '../commons/redis-client.service';
import { WebsocketExceptionsFilter } from '../filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { RedisKey, RedisFieldPrefix } from 'src/commons/enums/redis.enum';
import { UserStatus } from 'src/users/enums/user-status.enum';
import { SocketRoomPrefix } from './enums/socket-room-prefix.enum';
import { Session, SessionData } from 'express-session';

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway({
  cors: corsConfig,
})
export class SocketConnectionGateway {
  @WebSocketServer() private server: Server;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  // socket서버가 열릴 때
  afterInit(): void {
    this.server.engine.use(sessionMiddleware(this.configService, this.redisService));
  }

  // client가 연결됬을 때
  async handleConnection(clientSocket: Socket): Promise<void> {
    const session = await this.getSessionBySocket(clientSocket);
    const userId = session?.userId;
    // 인증에 실패했을때 연결 끊기
    if (!userId) {
      clientSocket.disconnect(true);
      return;
    }

    // 중복으로 로그인한 유저가 존재할 때 이전에 연결 끊기
    const currentLoginSocket = await this.userToSocket(userId);
    if (currentLoginSocket) {
      await this.removeClientRedis(currentLoginSocket.id, userId);
      currentLoginSocket.disconnect(true);
    }

    await clientSocket.join(SocketRoomPrefix.USER_ID + userId.toString());
    await this.initClientRedis(clientSocket.id, userId, session.id);
  }

  // client와 연결이 해제 됬을 때
  async handleDisconnect(clientSocket: Socket): Promise<void> {
    const userId = await this.socketToUserId(clientSocket.id);
    if (userId) this.removeClientRedis(clientSocket.id, userId);
  }

  private async initClientRedis(
    clientSocketId: string,
    userId: string | number,
    sessionId: string,
  ): Promise<void> {
    await this.redisService.hset(
      RedisKey.SOCKET_TO_USER,
      RedisFieldPrefix.SOCKET_ID + clientSocketId,
      userId,
    );
    await this.redisService.hset(
      RedisKey.USER_TO_SOCKET,
      RedisFieldPrefix.USER_ID + userId,
      clientSocketId,
    );
    await this.redisService.hset(
      RedisKey.USER_STATUS,
      RedisFieldPrefix.USER_ID + userId,
      UserStatus.ONLINE,
    );
    await this.redisService.hset(
      RedisKey.USER_TO_SESSION,
      RedisFieldPrefix.USER_ID + userId,
      sessionId,
    );
  }

  private async removeClientRedis(clientSocketId: string, userId: string | number): Promise<void> {
    await this.redisService.hdel(
      RedisKey.SOCKET_TO_USER,
      RedisFieldPrefix.SOCKET_ID + clientSocketId,
    );
    await this.redisService.hdel(RedisKey.USER_TO_SOCKET, RedisFieldPrefix.USER_ID + userId);
    await this.redisService.hdel(RedisKey.USER_STATUS, RedisFieldPrefix.USER_ID + userId);
    await this.redisService.hdel(RedisKey.USER_TO_SESSION, RedisFieldPrefix.USER_ID + userId);
  }

  async socketToUserId(socketId: string): Promise<number> {
    const userId = parseInt(
      await this.redisService.hget(RedisKey.SOCKET_TO_USER, RedisFieldPrefix.SOCKET_ID + socketId),
    );
    return userId;
  }

  async userToSocket(userId: number): Promise<Socket | null> {
    const socketId = await this.redisService.hget(
      RedisKey.USER_TO_SOCKET,
      RedisFieldPrefix.USER_ID + userId,
    );
    const socket = this.server.sockets.sockets.get(socketId);
    return socket;
  }

  getSessionIdByUser(userId: number) {
    return this.redisService.hget(RedisKey.USER_TO_SESSION, RedisFieldPrefix.USER_ID + userId);
  }

  async getSessionBySocket(clientSocket: Socket): Promise<(Session & Partial<SessionData>) | null> {
    // 쿠키로 인증
    let session = clientSocket.request.session;
    if (!session.userId) {
      // authorization헤더로 인증
      const sessionId = clientSocket.request.headers.authorization;
      session = JSON.parse(
        await this.redisService.client.get(RedisFieldPrefix.SESSION_ID + sessionId),
      );
      if (session) session.id = sessionId;
    }
    return session;
  }

  async getUserStatus(userId: number): Promise<UserStatus> {
    const socketId = await this.userToSocket(userId);
    if (!socketId) {
      return UserStatus.OFFLINE;
    }

    return this.redisService.hget(
      RedisKey.USER_STATUS,
      RedisFieldPrefix.USER_ID + userId,
    ) as Promise<UserStatus>;
  }
}
