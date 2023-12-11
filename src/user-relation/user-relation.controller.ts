import { Controller, Param, Post, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { UserRelationService } from './user-relation.service';
import { ShowFriendRelationsDto } from './dtos/show-friend-relations.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';
import { Serialize } from 'src/interceptors/serializer.interceptor';
import { ShowUserIdDto } from './dtos/show-user-id.dto';

@UseGuards(AuthGuard)
@Controller('user-relation')
export class UserRelationController {
  constructor(private userRelationService: UserRelationService) {}

  @Get('friends/relations')
  @Serialize(ShowFriendRelationsDto)
  getRelationList(@GetUser() user: User): Promise<ShowFriendRelationsDto[]> {
    return this.userRelationService.findAllFriendRelations(user.id);
  }

  @Get('friends')
  @Serialize(ShowUserIdDto)
  getFriendsList(@GetUser() user: User): Promise<ShowUserIdDto[]> {
    return this.userRelationService.findAllFriends(user.id);
  }

  @Post('friends/:user_id/request')
  async requestFriend(
    @GetUser() user: User,
    @Param('user_id', UserByIdPipe) otherUser: User,
  ): Promise<void> {
    await this.userRelationService.createFriendRequest(user, otherUser);
  }

  @Delete('friends/:user_id/disconnect')
  async deleteFriend(@GetUser() user: User, @Param('user_id') otherUserId: number): Promise<void> {
    await this.userRelationService.deleteFriendship(user.id, otherUserId);
  }

  @Put('friends/:user_id/accept')
  async acceptFriend(@GetUser() user: User, @Param('user_id') otherUserId: number): Promise<void> {
    await this.userRelationService.establishFriendship(user.id, otherUserId);
  }

  @Delete('friends/:user_id/reject')
  async rejectUser(@GetUser() user: User, @Param('user_id') otherUserId: number): Promise<void> {
    await this.userRelationService.rejectFriendship(user.id, otherUserId);
  }

  @Post('block/:user_id')
  async blockUser(
    @GetUser() user: User,
    @Param('user_id', UserByIdPipe) otherUser: User,
  ): Promise<void> {
    await this.userRelationService.createBlockRelation(user, otherUser);
  }

  @Delete('block/:user_id')
  async unblockUser(@GetUser() user: User, @Param('user_id') otherUserId: number): Promise<void> {
    await this.userRelationService.unblockUserRelation(user.id, otherUserId);
  }

  @Get('block')
  @Serialize(ShowUserIdDto)
  getblockList(@GetUser() user: User): Promise<ShowUserIdDto[]> {
    return this.userRelationService.findAllBlockedUsers(user.id);
  }
}
