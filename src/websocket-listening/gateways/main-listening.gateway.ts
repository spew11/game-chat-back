import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { sessionMiddleware } from '@configs/session.config';
import { ConfigService } from '@nestjs/config';
import { UseFilters } from '@nestjs/common';
import { RedisService } from '../../commons/redis-client.service';
import { WebsocketExceptionsFilter } from '../../filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { RedisField } from 'src/commons/enums/redis.enum';

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway({
  cors: corsConfig,
})
export class MainListeningGateway {
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
    const userId = await this.redisService.getUserIdBySession(clientSocket);
    if (!userId) {
      clientSocket.disconnect(true);
      return;
    }

    // 이미 로그인한 유저가 존재할 때 상대 연결 끊기
    const currentLoginSocketId = await this.redisService.userToSocket(userId);
    if (currentLoginSocketId) {
      const currentLoginSocket = this.server.sockets.sockets.get(currentLoginSocketId);
      if (currentLoginSocket) {
        currentLoginSocket.disconnect(true);
        // 상대 session만료시키기?
      }
    }

    clientSocket.join(userId.toString());
    this.initClientRedis(clientSocket.id, userId);
  }

  // client와 연결이 해제 됬을 때
  async handleDisconnect(clientSocket: Socket): Promise<void> {
    const userId = await this.redisService.socketToUser(clientSocket.id);
    if (userId) this.removeClientRedis(clientSocket.id, userId);
  }

  private async initClientRedis(clientSocketId: string, userId: string | number): Promise<void> {
    await this.redisService.hset(clientSocketId, RedisField.SOCKET_TO_USER, userId);
    await this.redisService.hset(userId, RedisField.USER_TO_SOCKER, clientSocketId);
    await this.redisService.hset(userId, RedisField.USER_STATUS, 'online');
  }

  private async removeClientRedis(clientSocketId: string, userId: string | number): Promise<void> {
    await this.redisService.hdel(clientSocketId, RedisField.SOCKET_TO_USER);
    await this.redisService.hdel(userId, RedisField.USER_TO_SOCKER);
    await this.redisService.hdel(userId, RedisField.USER_STATUS);
  }
}
