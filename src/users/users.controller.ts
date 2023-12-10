import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ShowUserOverviewDto } from './dtos/show-user-overview.dto';
import { ShowUserDetailsDto } from './dtos/show-user-details.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/user.decorator';
import { User } from './entities/user.entity';
import { ShowUserInforamtionDto } from './dtos/show-user-information';
import { Serialize } from 'src/interceptors/serializer.interceptor';
import { SocketConnectionGateway } from 'src/socket-connection/socket-connection.gateway';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private socketConnectionGateway: SocketConnectionGateway,
  ) {}

  @Get()
  @Serialize(ShowUserOverviewDto)
  getUsersOverview(): Promise<ShowUserOverviewDto[]> {
    return this.usersService.findAllUsers();
  }

  @Get('me')
  @Serialize(ShowUserInforamtionDto)
  async getUserInfomation(@GetUser() user: User): Promise<ShowUserInforamtionDto> {
    const userDetail = await this.usersService.findUserDetailById(user.id);
    const userStatus = await this.socketConnectionGateway.getUserStatus(userDetail.id);
    return { ...userDetail, status: userStatus };
  }

  @Get(':user_id')
  @Serialize(ShowUserDetailsDto)
  async getUserDetails(@Param('user_id') userId: number): Promise<ShowUserDetailsDto> {
    const user = await this.usersService.findUserDetailById(userId);
    const userStatus = await this.socketConnectionGateway.getUserStatus(userId);
    return { ...user, status: userStatus };
  }

  @Put('me')
  async updateUser(@GetUser() user: User, @Body() userDto: UpdateUserDto): Promise<void> {
    await this.usersService.updateUser(user, userDto);
  }
}
