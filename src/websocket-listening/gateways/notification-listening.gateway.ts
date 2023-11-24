import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotFoundException, UseFilters } from '@nestjs/common';
import { WebsocketExceptionsFilter } from '../../filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { dtoSerializer } from 'src/utils/dtoSerializer.util';
import { NotiFriendRequestDto } from 'src/notifications/dtos/noti-friend-request.dto';
import { NotiChannelInviteDto } from 'src/notifications/dtos/noti-channel-invite.dto';
import { ChannelsService } from 'src/channels/channels.service';
import { UserRelationService } from 'src/user-relation/user-relation.service';
import { RedisService } from 'src/commons/redis-client.service';

type Noti = NotiChannelInviteDto | NotiFriendRequestDto;

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway({
  cors: corsConfig,
})
export class NotificationListeningGateway {
  @WebSocketServer() private server: Server;

  constructor(
    private redisService: RedisService,
    private channelsService: ChannelsService,
    private userRelationService: UserRelationService,
  ) {}

  @SubscribeMessage('noti-unread')
  async getUnreadNoti(@ConnectedSocket() clientSocket: Socket) {
    const userId = await this.redisService.socketToUser(clientSocket.id);
    if (!userId) {
      throw new NotFoundException('해당 socket으로 userId를 찾을 수 없습니다.: getUnreadNoti');
    }
    const penddings = await this.userRelationService.findAllPendingApproval(userId);
    const invitations = await this.channelsService.findAllInvitation(userId);

    const penddingDtos = dtoSerializer(NotiFriendRequestDto, penddings) as Noti[];
    const invitationDtos = dtoSerializer(NotiChannelInviteDto, invitations) as Noti[];

    const notis = penddingDtos
      .concat(invitationDtos)
      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    return notis;
  }
}
