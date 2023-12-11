import { Module } from '@nestjs/common';
import { GamesGateway } from './games.gateway';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { UsersModule } from 'src/users/users.module';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';
import { CommonsModule } from 'src/commons/commons.module';

@Module({
  imports: [SocketConnectionModule, UsersModule, CommonsModule],
  controllers: [GamesController],
  providers: [GamesGateway, GamesService],
})
export class GamesModule {}
