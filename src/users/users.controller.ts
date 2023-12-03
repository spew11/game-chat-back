import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ShowUserOverviewDto } from './dtos/show-user-overview.dto';
import { ShowUserDetailsDto } from './dtos/show-user-details.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from './user.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';
import { ShowUserInforamtionDto } from './dtos/show-user-information';
import { Serialize } from 'src/interceptors/serializer.interceptor';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Serialize(ShowUserOverviewDto)
  getUsersOverview(): Promise<ShowUserOverviewDto[]> {
    return this.usersService.findAllUsers();
  }

  @Get('me')
  @Serialize(ShowUserInforamtionDto)
  getUserInfomation(@GetUser() user: User): ShowUserInforamtionDto {
    return user;
  }

  @Get(':user_id')
  @Serialize(ShowUserDetailsDto)
  getUserDetails(@Param('user_id', UserByIdPipe) user: User): ShowUserDetailsDto {
    return user;
  }

  @Put('me')
  async updateUser(@GetUser() user: User, @Body() userDto: UpdateUserDto): Promise<void> {
    await this.usersService.updateUser(user, userDto);
  }
}
