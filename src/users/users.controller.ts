import { Body, Controller, Get, Param, Put, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ShowUserOverviewDto } from './dto/show-user-overview.dto';
import { ShowUserDetailsDto } from './dto/show-user-details.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService){ }

    @Get()
    async getUsersOverview(): Promise<ShowUserOverviewDto[]> {
        const users = await this.usersService.findAllUsers();
        const userDtos: ShowUserOverviewDto[] = users.map(user => {
            const userDto = new ShowUserOverviewDto();
            userDto.avatar = user.avatar;
            userDto.ladderPoint = user.ladderPoint;
            userDto.nickname = user.nickname;
            return userDto;
        });
        return userDtos;
    }

    @Get('info/:user_id')
    async getUserDetails(@Param('user_id') id: number) : Promise<ShowUserDetailsDto> {
        const user = await this.usersService.findById(id);
        const userDto = new ShowUserDetailsDto();
        userDto.avatar = user.avatar;
        userDto.bio = user.bio;
        userDto.email = user.email;
        userDto.ladderPoint = user.ladderPoint;
        userDto.nickname = user.nickname;
        return userDto;
    }


    @Put('me')
    async updateUser(@Body() userDto: UpdateUserDetailsDto): Promise<void> {
        const userId = 1; // 로그인된 사용자의 ID 가져오기 (추후 수정하자)
        await this.usersService.updateUser(userId, userDto);
    }
}
