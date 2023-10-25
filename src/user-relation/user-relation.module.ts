import { Module } from '@nestjs/common';
import { UserRelationController } from './user-relation.controller';
import { UserRelationService } from './user-relation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelation } from './user-relation.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRelation, User]), UsersModule],
  controllers: [UserRelationController],
  providers: [UserRelationService],
  exports: [TypeOrmModule.forFeature([UserRelation]), UserRelationService],
})
export class UserRelationModule {}
