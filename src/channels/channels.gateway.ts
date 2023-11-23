import { corsConfig } from '@configs/cors.config';
import {
  Inject,
  NotFoundException,
  UseFilters,
  UsePipes,
  ValidationPipe,
  forwardRef,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { MainGateway } from 'src/commons/main.gateway';
import { UsersService } from 'src/users/users.service';
import { ChannelRelation } from './entities/channel-relation.entity';
import { ChannelMessageDto } from './dto/channel-message.dto';
import { UserRelationService } from 'src/user-relation/user-relation.service';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class ChannelsGateway {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => MainGateway))
    private mainGateway: MainGateway,
    private usersService: UsersService,
    @Inject(forwardRef(() => UserRelationService))
    private userRelationService: UserRelationService,
  ) {}

  @SubscribeMessage('channel-message')
  async communicateChannelMessage(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() { channelId, content }: ChannelMessageDto,
  ) {
    const senderId = await this.mainGateway.socketToUser(clientSocket.id);
    const sender = await this.usersService.findById(senderId);
    if (!sender) {
      throw new NotFoundException('잘못된 userId입니다.: communicateChannelMessage');
    }

    const blockingUsers = await this.userRelationService.findAllBlockingUsers(senderId);
    const channelRoom = this.server.to(channelId.toString());
    const channelRoomWithoutBlock = blockingUsers.reduce(
      (room, user) => room.except(user.id.toString()),
      channelRoom,
    );

    channelRoomWithoutBlock.emit('channel-message', {
      channelId,
      sender,
      content,
    });
  }

  emitChannelMemberUpdate(channelId: number, channelRelation: ChannelRelation) {
    // prettier-ignore
    this.server
      .to(channelId.toString())
      .emit('channel-member', {
        channelId,
        channelRelation,
      });
  }

  async joinChannelRoom(channelRelation: ChannelRelation) {
    // 보다 엄격한 channelRelation 타입 체크 필요
    const userId = channelRelation.user.id;
    const channelId = channelRelation.channel.id;

    const clientSocket = await this.mainGateway.userToSocket(userId);
    clientSocket.join(channelId.toString());

    // prettier-ignore
    this.server
      .to(channelId.toString())
      .emit('channel-in', {
        channelId,
        channelRelation
      });
  }

  async leaveChannelRoom(userId: number, channelId: number, channelRelationId: number) {
    const clientSocket = await this.mainGateway.userToSocket(userId);
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
