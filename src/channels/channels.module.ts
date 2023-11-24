import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelRelation } from './entities/channel-relation.entity';
import { ChannelInvitation } from './entities/channel-invitation.entity';
import { ChannelsEmitGateway } from './channels-emit.gateway';
import { CommonsModule } from 'src/commons/commons.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelRelation, ChannelInvitation]),
    NotificationsModule,
    UsersModule,
    CommonsModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsEmitGateway],
  exports: [ChannelsService],
})
export class ChannelsModule {}
