import { Module } from '@nestjs/common';
import { GamesGateway } from './games.gateway';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchHistory } from './match-history.entity';
import { CommonsModule } from 'src/commons/commons.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchHistory]), CommonsModule, UsersModule],
  providers: [GamesGateway, GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
