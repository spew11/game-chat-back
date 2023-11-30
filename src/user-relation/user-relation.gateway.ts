import { corsConfig } from '@configs/cors.config';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exception.fileter';
import { UserRelation } from './user-relation.entity';
import { NotiFriendRequestDto } from '../notifications/dtos/noti-friend-request.dto';
import { dtoSerializer } from 'src/utils/dtoSerializer.util';
import { Server } from 'socket.io';
import { PRIVAVE_PREFIX } from 'src/socket-connection/socket-connection.gateway';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: corsConfig,
})
export class UserRelationGateway {
  @WebSocketServer() server: Server;

  // prettier-ignore
  notiFriendRequest(pendingRelation: UserRelation) {
      const requestedUserId = pendingRelation.user.id.toString()
      const noti = dtoSerializer(NotiFriendRequestDto, pendingRelation)
      this.server
        .to(PRIVAVE_PREFIX + requestedUserId)
        .emit('noti', noti)
    }
}
