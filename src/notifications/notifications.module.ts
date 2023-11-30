import { Module } from '@nestjs/common';
import { NotificaionsGateway } from './notifications.gateway';
import { UserRelationModule } from 'src/user-relation/user-relation.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';

@Module({
  imports: [SocketConnectionModule, UserRelationModule, ChannelsModule],
  providers: [NotificaionsGateway],
})
export class NotificationsModule {}
