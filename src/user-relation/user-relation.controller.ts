import { Controller, Param, Post, Delete, Get, Put } from '@nestjs/common';
import { UserRelationService } from './user-relation.service';
import { ShowFriendsDto } from './dtos/show-friends.dto';
import { ShowBlockedUsersDto } from './dtos/show-blocked-users.dto';

@Controller('users')
export class UserRelationController {
    constructor(private userRelationService: UserRelationService){}
    
    @Get('friends')
    async getFriendsList(): Promise<ShowFriendsDto[]> {
        const userId = 1; //로그인 구현전이라 임시로 설정함
        const friends = await this.userRelationService.findAllFriends(userId);
        const userDtos: ShowFriendsDto[] = friends.map(friend => {
            const userDto = new ShowFriendsDto();
            userDto.otherUserId = friend.id;
            userDto.nickname = friend.nickname;
            return userDto;
        });
        return userDtos;
    }

    @Post('friends/request/:user_id')
    async requestFriend(@Param('user_id') otherUserId: number): Promise<void> {
        const userId = 10;
        await this.userRelationService.createFriendRequest(userId, otherUserId);
    }

    @Delete('friends/:user_id')
    async deleteFriend(@Param('user_id') otherUserId: number): Promise<void> {
        const userId = 1;
        await this.userRelationService.removeUserRelation(userId, otherUserId);
        await this.userRelationService.removeUserRelation(otherUserId, userId);
    }

    @Put('friends/accept/:user_id')
    async acceptFriend(@Param('user_id') otherUserId: number): Promise<void> {
        const userId = 10;
        await this.userRelationService.establishFriendship(userId, otherUserId);
    }

    @Delete('reject/:user_id')
    async rejectUser(@Param('user_id') otherUserId: number): Promise<void> {
        const userId = 10;
        await this.userRelationService.removeUserRelation(userId, otherUserId);
        await this.userRelationService.removeUserRelation(otherUserId, userId);
    }

    @Post('block/:user_id')
    async blockUser(@Param('user_id') otherUserId: number): Promise<void> {
        const userId = 1;
        await this.userRelationService.createBlockRelation(userId, otherUserId);
    }

    @Delete('block/:user_id')
    async unblockUser(@Param('user_id') otherUserId: number): Promise<void> {
        const userId = 1;
        await this.userRelationService.removeUserRelation(userId, otherUserId);
    }

    @Get('block')
    async getblockList(): Promise<ShowBlockedUsersDto[]> {
        const userId = 1;
        const blockedUsers = await this.userRelationService.findAllBlockedUsers(userId);
        const userDtos: ShowBlockedUsersDto[] = blockedUsers.map(blockedUser => {
            const userDto = new ShowBlockedUsersDto();
            userDto.otherUserId = blockedUser.id;
            userDto.nickname = blockedUser.nickname;
            return userDto;
        });
        return userDtos;
    }
}
