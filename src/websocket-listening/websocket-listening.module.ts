import { Module } from '@nestjs/common';
import { MainListeningGateway } from './gateways/main-listening.gateway';
import { CommonsModule } from 'src/commons/commons.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { UserRelationModule } from 'src/user-relation/user-relation.module';
import { ChannelListeningGateway } from './gateways/channel-listening.gateway';
import { NotificationListeningGateway } from './gateways/notification-listening.gateway';
import { DMListeningGateway } from './gateways/dm-listening.gateway';
import { DirectMessagesModule } from 'src/direct-messages/direct-messages.module';

@Module({
  imports: [CommonsModule, ChannelsModule, UserRelationModule, DirectMessagesModule],
  providers: [
    MainListeningGateway,
    ChannelListeningGateway,
    NotificationListeningGateway,
    DMListeningGateway,
  ],
})
export class WebsocketListeningModule {}
