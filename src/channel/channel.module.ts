import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelRelation } from './entities/channel-relation.entity';
import { ChannelMutedUser } from './entities/channel-mutedUser.entity';
import { ChannelBannedUser } from './entities/channel-bannedUser.entity';
import { UsersModule } from 'src/users/users.module';

import { ChatGateway } from './channel.gateway';
import { ChatService } from './services/channel-chat.service';
import { ChannelService } from './services/channel.service';
import { JwtService } from '@nestjs/jwt';

import { ChannelController } from './channel.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelRelation, ChannelMutedUser, ChannelBannedUser]),
    UsersModule,
  ],
  controllers: [ChannelController],
  providers: [ChatGateway, ChatService, ChannelService, JwtService],
  exports: [ChatGateway, ChatService, ChannelService, JwtService]
})
export class ChannelModule { }
