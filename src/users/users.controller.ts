import { Body, Controller, Get, Param, Put, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ShowUserOverviewDto } from './dtos/show-user-overview.dto';
import { ShowUserDetailsDto } from './dtos/show-user-details.dto';
import { UpdateUserDetailsDto } from './dtos/update-user-details.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService){ }

    @Get(':id')
    async getUserDetails(@Param('id') id: number) : Promise<ShowUserDetailsDto> {
        const user = await this.usersService.findById(id);
        const userDto = new ShowUserDetailsDto();
        userDto.avatar = user.avatar;
        userDto.bio = user.bio;
        userDto.email = user.email;
        userDto.ladderPoint = user.ladderPoint;
        userDto.nickname = user.nickname;
        return userDto;
    }

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

    @Put('me')
    async updateUser(@Body() userDto: UpdateUserDetailsDto): Promise<void> {
        const userId = 1; // 로그인된 사용자의 ID 가져오기 (추후 수정하자)
        await this.usersService.updateUser(userId, userDto);
    }
    
    // @Post('/register')
    // userAdd(@Req() request: Request, @Body() createUserDto: CreateUserDto ) : Promise<void> {
        // const cookies = request.cookies;
        // 쿠키에서 세션식별자 찾아서 멤버 찾는 로직
        // user.nickname = createUserDto.nickname;
    // }
}
