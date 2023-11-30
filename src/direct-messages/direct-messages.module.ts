import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './entitys/direct-message.entity';
import { DirectMessagesService } from './direct-messages.service';
import { CommonsModule } from 'src/commons/commons.module';
import { UserRelationModule } from 'src/user-relation/user-relation.module';
import { UsersModule } from 'src/users/users.module';
import { DirectMessagesGateway } from './direct-messages.gateway';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DirectMessage]),
    UsersModule,
    UserRelationModule,
    CommonsModule,
    SocketConnectionModule,
  ],
  providers: [DirectMessagesService, DirectMessagesGateway],
})
export class DirectMessagesModule {}
