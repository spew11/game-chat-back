import { Module, forwardRef } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { UserRelationModule } from 'src/user-relation/user-relation.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { CommonsModule } from 'src/commons/commons.module';

@Module({
  imports: [forwardRef(() => UserRelationModule), forwardRef(() => ChannelsModule), CommonsModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway, CommonsModule],
})
export class NotificationsModule {}
