import { corsConfig } from '@configs/cors.config';
import { NotFoundException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { ChannelRelation } from './entities/channel-relation.entity';
import { RedisService } from 'src/commons/redis-client.service';
import { dtoSerializer } from 'src/utils/dtoSerializer.util';
import { ChannelMemberUpdateDto } from './dto/channel-member-update.dto';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class ChannelsEmitGateway {
  @WebSocketServer() server: Server;

  constructor(private redisService: RedisService) {}

  emitChannelMemberUpdate(channelId: number, channelRelation: ChannelRelation) {
    const dto = dtoSerializer(ChannelMemberUpdateDto, {
      channelId,
      channelRelation,
    });
    // prettier-ignore
    this.server
      .to(channelId.toString())
      .emit('channel-member', dto);
  }

  async joinChannelRoom(channelRelation: ChannelRelation) {
    // 보다 엄격한 channelRelation 타입 체크 필요
    const userId = channelRelation.user.id;
    const channelId = channelRelation.channel.id;

    const clientSocketId = await this.redisService.userToSocket(userId);
    if (!clientSocketId) {
      throw new NotFoundException('해당유저의 socket을 찾을수 없습니다.: joinChannelRoom');
    }
    const clientSocket = this.server.sockets.sockets.get(clientSocketId);
    if (!clientSocket) {
      throw new NotFoundException('해당socketId의 socket을 찾을수 없습니다.: joinChannelRoom');
    }
    clientSocket.join(channelId.toString());

    const dto = dtoSerializer(ChannelMemberUpdateDto, {
      channelId,
      channelRelation,
    });

    // prettier-ignore
    this.server
      .to(channelId.toString())
      .emit('channel-in', dto);
  }

  async leaveChannelRoom(userId: number, channelId: number, channelRelationId: number) {
    const clientSocketId = await this.redisService.userToSocket(userId);
    if (!clientSocketId) {
      throw new NotFoundException('해당유저의 socket을 찾을수 없습니다.: leaveChannelRoom');
    }
    const clientSocket = this.server.sockets.sockets.get(clientSocketId);
    if (!clientSocket) {
      throw new NotFoundException('해당socketId의 socket을 찾을수 없습니다.: joinChannelRoom');
    }
    clientSocket.leave(channelId.toString());

    // prettier-ignore
    this.server
      .to(channelId.toString())
      .emit('channel-out', {
        channelId,
        channelRelationId
      });
  }
}
