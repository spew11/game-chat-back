import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ShowUserOverviewDto } from './dto/show-user-overview.dto';
import { ShowUserDetailsDto } from './dto/show-user-details.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from './user.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsersOverview(): Promise<ShowUserOverviewDto[]> {
    const users = await this.usersService.findAllUsers();
    const userDtos: ShowUserOverviewDto[] = users.map((user) => {
      const userDto = new ShowUserOverviewDto();
      userDto.id = user.id;
      userDto.avatar = user.avatar;
      userDto.ladderPoint = user.ladderPoint;
      userDto.nickname = user.nickname;
      return userDto;
    });
    return userDtos;
  }

  @Get(':user_id')
  async getUserDetails(@Param('user_id', UserByIdPipe) user: User): Promise<ShowUserDetailsDto> {
    const userDto = new ShowUserDetailsDto();
    userDto.avatar = user.avatar;
    userDto.bio = user.bio;
    userDto.email = user.email;
    userDto.ladderPoint = user.ladderPoint;
    userDto.nickname = user.nickname;
    return userDto;
  }

  @Put('me')
  updateUser(@GetUser() user: User, @Body() userDto: UpdateUserDetailsDto): void {
    this.usersService.updateUser(user, userDto);
  }
}
