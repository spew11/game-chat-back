import { Controller, Param, Post, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { UserRelationService } from './user-relation.service';
import { ShowFriendsDto } from './dtos/show-friends.dto';
import { ShowBlockedUsersDto } from './dtos/show-blocked-users.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';

@UseGuards(AuthGuard)
@Controller('users')
export class UserRelationController {
    constructor(private userRelationService: UserRelationService){}
    
    @Get('friends')
    async getFriendsList(@GetUser() user: User): Promise<ShowFriendsDto[]> {
        const friends = await this.userRelationService.findAllFriends(user.id);
        const userDtos: ShowFriendsDto[] = friends.map(friend => {
            const userDto = new ShowFriendsDto();
            userDto.otherUserId = friend.id;
            userDto.nickname = friend.nickname;
            return userDto;
        });
        return userDtos;
    }

    @Post('friends/request/:user_id')
    async requestFriend(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): Promise<void> {
        await this.userRelationService.createFriendRequest(user, otherUser);
    }

    @Delete('friends/:user_id')
    async deleteFriend(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): Promise<void> {
        this.userRelationService.removeUserRelation(user.id, otherUser.id);
        this.userRelationService.removeUserRelation(otherUser.id, user.id);
    }

    @Put('friends/accept/:user_id')
    async acceptFriend(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): Promise<void> {
        await this.userRelationService.establishFriendship(user.id, otherUser.id);
    }

    @Delete('reject/:user_id')
    async rejectUser(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): Promise<void> {
        this.userRelationService.removeUserRelation(user.id, otherUser.id);
        this.userRelationService.removeUserRelation(otherUser.id, user.id);
    }

    @Post('block/:user_id')
    async blockUser(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): Promise<void> {
        await this.userRelationService.createBlockRelation(user, otherUser);
    }

    @Delete('block/:user_id')
    async unblockUser(@GetUser() user: User, @Param('user_id', UserByIdPipe) otherUser: User): Promise<void> {
        this.userRelationService.removeUserRelation(user.id, otherUser.id);
    }

    @Get('block')
    async getblockList(@GetUser() user: User): Promise<ShowBlockedUsersDto[]> {
        const blockedUsers = await this.userRelationService.findAllBlockedUsers(user.id);
        const userDtos: ShowBlockedUsersDto[] = blockedUsers.map(blockedUser => {
            const userDto = new ShowBlockedUsersDto();
            userDto.otherUserId = blockedUser.id;
            userDto.nickname = blockedUser.nickname;
            return userDto;
        });
        return userDtos;
    }
}
