import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { User } from 'src/users/user.entity';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { corsConfig } from '@configs/cors.config';
import { NotificationType } from './enums/notification.enum';
import { dtoSerializer } from 'src/utils/dtoSerializer.util';
import { NotiChannelInviteDto } from './dtos/noti-channel-invite.dto';
import { NotiFriendRequestDto } from './dtos/noti-friend-request.dto';
import { UserRelation } from 'src/user-relation/user-relation.entity';
import { ChannelInvitation } from 'src/channels/entities/channel-invitation.entity';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class NotificationsEmitGateway {
  @WebSocketServer() server: Server;

  constructor() {}

  // prettier-ignore
  notiGameInvite(invitedUserId: number, invitingUser: User) {
    this.server
      .to(invitedUserId.toString())
      .emit('noti', { 
        type: NotificationType.GAME_INVITE,
        invitingUser
        // gameType
      });
  }

  // prettier-ignore
  notiChannelInvite(invitation: ChannelInvitation) {
    const invitedUserId = invitation.user.id.toString()
    const noti = dtoSerializer(NotiChannelInviteDto, invitation)
    this.server
      .to(invitedUserId)
      .emit('noti', noti);
  }

  // prettier-ignore
  notiFriendRequest(pendingRelation: UserRelation) {
    const requestedUserId = pendingRelation.user.id.toString()
    const noti = dtoSerializer(NotiFriendRequestDto, pendingRelation)
    this.server
      .to(requestedUserId)
      .emit('noti', noti)
  }
}
