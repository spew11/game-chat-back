import { Module, forwardRef } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelRelation } from './entities/channel-relation.entity';
import { ChannelInvitation } from './entities/channel-invitation.entity';
import { ChannelsGateway } from './channels.gateway';
import { CommonsModule } from 'src/commons/commons.module';
import { UserRelationModule } from 'src/user-relation/user-relation.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => UserRelationModule),
    TypeOrmModule.forFeature([Channel, ChannelRelation, ChannelInvitation]),
    CommonsModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsGateway],
  exports: [ChannelsService],
})
export class ChannelsModule {}
