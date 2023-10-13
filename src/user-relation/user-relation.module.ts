import { Module } from '@nestjs/common';
import { UserRelationController } from './user-relation.controller';
import { UserRelationService } from './user-relation.service';

@Module({
  controllers: [UserRelationController],
  providers: [UserRelationService]
})
export class UserRelationModule {}
