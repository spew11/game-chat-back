import { Controller, Param, Post, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { UserRelationService } from './user-relation.service';
import { ShowFriendsDto } from './dtos/show-friends.dto';
import { ShowBlockedUsersDto } from './dtos/show-blocked-users.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/user.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';

@UseGuards(AuthGuard)
@Controller('user-relation')
export class UserRelationController {
  constructor(private userRelationService: UserRelationService) {}

  @Get('friends')
  async getFriendsList(@GetUser() user: User): Promise<ShowFriendsDto[]> {
    const friends = await this.userRelationService.findAllRelations(user.id);
    const userDtos: ShowFriendsDto[] = friends.map((friend) => {
      const userDto = new ShowFriendsDto();
      userDto.otherUserId = friend.id;
      userDto.nickname = friend.nickname;
      return userDto;
    });
    return userDtos;
  }

  @Post('friends/:user_id/request')
  requestFriend(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): void {
    this.userRelationService.createFriendRequest(user, otherUser);
  }

  @Delete('friends/:user_id/disconnect')
  deleteFriend(@GetUser() user: User, @Param('user_id') otherUserId: number): void {
    this.userRelationService.deleteFriendship(user.id, otherUserId);
  }

  @Put('friends/:user_id/accept')
  acceptFriend(@GetUser() user: User, @Param('user_id') otherUserId: number): void {
    this.userRelationService.establishFriendship(user.id, otherUserId);
  }

  @Delete('friends/:user_id/reject')
  rejectUser(@GetUser() user: User, @Param('user_id') otherUserId: number): void {
    this.userRelationService.rejectFriendship(user.id, otherUserId);
  }

  @Post('block/:user_id')
  blockUser(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): void {
    this.userRelationService.createBlockRelation(user, otherUser);
  }

  @Delete('block/:user_id')
  unblockUser(@GetUser() user: User, @Param('user_id') otherUserId: number): void {
    this.userRelationService.unblockUserRelation(user.id, otherUserId);
  }

  @Get('block')
  async getblockList(@GetUser() user: User): Promise<ShowBlockedUsersDto[]> {
    const blockedUsers = await this.userRelationService.findAllBlockedUsers(user.id);
    const userDtos: ShowBlockedUsersDto[] = blockedUsers.map((blockedUser) => {
      const userDto = new ShowBlockedUsersDto();
      userDto.otherUserId = blockedUser.id;
      userDto.nickname = blockedUser.nickname;
      return userDto;
    });
    return userDtos;
  }
}
