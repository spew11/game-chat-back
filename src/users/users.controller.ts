import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterConfigService } from 'src/commons/MulterConfig.service';
import { promises as fs } from 'fs';
import { Response } from 'express';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';

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

  @Put('me/avatar')
  @UseInterceptors(FileInterceptor('file', MulterConfigService.createMulterOptions()))
  async updateAvatar(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    const filename = file ? file.filename : null;
    await this.usersService.updateUserAvatar(user, filename);
  }
}
