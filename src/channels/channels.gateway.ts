import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Inject,
  BadRequestException,
  NotFoundException,
  UseFilters,
  UsePipes,
  ValidationPipe,
  forwardRef,
} from '@nestjs/common';
import { WebsocketExceptionsFilter } from '../filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { ChannelsService } from 'src/channels/channels.service';
import { ChannelMessageReceiveDto } from './dto/channel-message-receive.dto';
import { UserRelationService } from 'src/user-relation/user-relation.service';
import { dtoSerializer } from 'src/utils/dtoSerializer.util';
import { ChannelMessageEmitDto } from './dto/channel-message-emit.dto';
import { ChannelRelation } from './entities/channel-relation.entity';
import { ChannelMemberUpdateDto } from './dto/channel-member-update.dto';
import { ChannelInvitation } from './entities/channel-invitation.entity';
import { NotiChannelInviteDto } from 'src/notifications/dtos/noti-channel-invite.dto';
import { SocketConnectionGateway } from 'src/socket-connection/socket-connection.gateway';
import { SocketRoomPrefix } from 'src/socket-connection/enums/socket.enum';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class ChannelGateway {
  @WebSocketServer() private server: Server;

  constructor(
    private socketConnectionGateway: SocketConnectionGateway,
    private userRelationService: UserRelationService,
    @Inject(forwardRef(() => ChannelsService))
    private channelsService: ChannelsService,
  ) {}

  // client가 연결됬을 때
  async handleConnection(clientSocket: Socket): Promise<void> {
    const userId = await this.socketConnectionGateway.getUserIdBySession(clientSocket);
    if (!userId) {
      clientSocket.disconnect(true);
      return;
    }

    const channelRelations = await this.channelsService.findChannelsByUser(userId);
    const rooms = channelRelations.map(
      (relation) => SocketRoomPrefix.CHANNEL_ID + relation.channel.id.toString(),
    );
    await clientSocket.join(rooms);
  }

  @SubscribeMessage('channel-message')
  async communicateChannelMessage(
    @ConnectedSocket() clientSocket: Socket,
    @MessageBody() { channelId, content }: ChannelMessageReceiveDto,
  ) {
    const senderId = await this.socketConnectionGateway.socketToUserId(clientSocket.id);
    const channelRelation = await this.channelsService.findOneChannelRelation(channelId, senderId);
    if (!channelRelation) {
      throw new NotFoundException('잘못된 channelId 입니다.: communicateChannelMessage');
    }
    if (channelRelation.isMuted) {
      throw new BadRequestException('mute된 유저입니다.');
    }

    const blockingUsers = await this.userRelationService.findAllBlockingUsers(senderId);
    const channelRoom = this.server.to(SocketRoomPrefix.CHANNEL_ID + channelId.toString());
    const channelRoomWithoutBlock = blockingUsers.reduce(
      (room, user) => room.except(user.id.toString()),
      channelRoom,
    );

    const messageEmitDto = dtoSerializer(ChannelMessageEmitDto, {
      channel: {
        id: channelId,
      },
      sender: channelRelation.user,
      content,
    });

    channelRoomWithoutBlock.emit('channel-message', messageEmitDto);
  }

  emitChannelMemberUpdate(channelId: number, channelRelation: ChannelRelation) {
    const MemberUpdatedto = dtoSerializer(ChannelMemberUpdateDto, {
      channel: {
        id: channelId,
      },
      channelRelation,
    });
    // prettier-ignore
    this.server
      .to(SocketRoomPrefix.CHANNEL_ID + channelId.toString())
      .emit('channel-member', MemberUpdatedto);
  }

  async joinChannelRoom(channelRelation: ChannelRelation) {
    // 보다 엄격한 channelRelation 타입 체크 필요
    const userId = channelRelation.user.id;
    const channel = channelRelation.channel;
    const clientSocket = await this.socketConnectionGateway.userToSocket(userId);
    if (!clientSocket) {
      throw new NotFoundException('user의 socket을 찾을수 없습니다.: joinChannelRoom');
    }

    await clientSocket.join(SocketRoomPrefix.CHANNEL_ID + channel.id.toString());

    const MemberUpdatedto = dtoSerializer(ChannelMemberUpdateDto, {
      channel,
      channelRelation,
    });
    // prettier-ignore
    this.server
      .to(SocketRoomPrefix.CHANNEL_ID + channel.id.toString())
      .emit('channel-in', MemberUpdatedto);
  }

  async leaveChannelRoom(userId: number, channelId: number) {
    const clientSocket = await this.socketConnectionGateway.userToSocket(userId);
    if (!clientSocket) {
      throw new NotFoundException('user의 socket을 찾을수 없습니다.: leaveChannelRoom');
    }

    await clientSocket.leave(SocketRoomPrefix.CHANNEL_ID + channelId.toString());

    // prettier-ignore
    this.server
      .to(SocketRoomPrefix.CHANNEL_ID + channelId.toString())
      .emit('channel-out', {
        channel: {
          id: channelId,
        },
        user: {
          id: userId
        }
      });
  }

  // prettier-ignore
  notiChannelInvite(invitation: ChannelInvitation) {
      const invitedUserId = invitation.user.id.toString()
      console.log()
      const noti = dtoSerializer(NotiChannelInviteDto, invitation)
      this.server
        .to(SocketRoomPrefix.USER_ID + invitedUserId)
        .emit('noti', noti);
    }
}
