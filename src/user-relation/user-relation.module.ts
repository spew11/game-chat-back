import { Module } from '@nestjs/common';
import { UserRelationController } from './user-relation.controller';
import { UserRelationService } from './user-relation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelation } from './user-relation.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { UserRelationGateway } from './user-relation.gateway';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRelation, User]), UsersModule, SocketConnectionModule],
  controllers: [UserRelationController],
  providers: [UserRelationService, UserRelationGateway],
  exports: [TypeOrmModule, UserRelationService],
})
export class UserRelationModule {}
