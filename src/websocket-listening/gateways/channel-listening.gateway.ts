import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotFoundException, UseFilters } from '@nestjs/common';
import { WebsocketExceptionsFilter } from '../../filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { ChannelsService } from 'src/channels/channels.service';
import { ChannelMessageDto } from 'src/channels/dto/channel-message.dto';
import { UserRelationService } from 'src/user-relation/user-relation.service';
import { RedisService } from 'src/commons/redis-client.service';

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway({
  cors: corsConfig,
})
export class ChannelListeningGateway {
  @WebSocketServer() private server: Server;

  constructor(
    private redisService: RedisService,
    private channelsService: ChannelsService,
    private userRelationService: UserRelationService,
  ) {}

  // client가 연결됬을 때
  async handleConnection(clientSocket: Socket): Promise<void> {
    const userId = await this.redisService.getUserIdBySession(clientSocket);
    if (!userId) {
      clientSocket.disconnect(true);
      return;
    }

    const channelRelations = await this.channelsService.findChannelsByUser(userId);
    channelRelations.forEach((relation) => clientSocket.join(relation.channel.id.toString()));
  }

  @SubscribeMessage('channel-message')
  async communicateChannelMessage(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() { channelId, content }: ChannelMessageDto,
  ) {
    const senderId = await this.redisService.socketToUser(clientSocket.id);
    const channelRelation = await this.channelsService.findOneChannelRelation(channelId, senderId);
    if (!channelRelation.user) {
      throw new NotFoundException('잘못된 (channelId, userId) 입니다.: communicateChannelMessage');
    }

    const blockingUsers = await this.userRelationService.findAllBlockingUsers(senderId);
    const channelRoom = this.server.to(channelId.toString());
    const channelRoomWithoutBlock = blockingUsers.reduce(
      (room, user) => room.except(user.id.toString()),
      channelRoom,
    );

    channelRoomWithoutBlock.emit('channel-message', {
      channelId,
      sender: channelRelation.user,
      content,
    });
  }
}
