import { ChannelByIdPipe } from './../pipes/ChannelById.Pipe';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/user.entity';
import { ChannelDto } from './dto/channel.dto';
import { Channel } from './entities/channel.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard, OwnerGuard } from './channels.guard';

@UseGuards(AuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}

  @Post()
  createChannel(@GetUser() user: User, @Body() channelDto: ChannelDto) {
    return this.channelService.createChannel(user, channelDto);
  }

  @Put(':channel_id')
  @UseGuards(OwnerGuard)
  updateChannel(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Body() channelDto: ChannelDto,
  ): Promise<Channel> {
    return this.channelService.updateChannel(channel, channelDto);
  }

  @Get(':channel_id')
  getOneChannel(@Param('channel_id') channelId: number) {
    return this.channelService.findOneChannel(channelId);
  }

  @Get()
  getAllChannels() {
    return this.channelService.findAllChannels();
  }

  @Delete(':channel_id')
  exitChannel(@GetUser() user: User, @Param('channel_id', ParseIntPipe) channelId: number) {
    return this.channelService.exitChannel(user, channelId);
  }

  @Get(':channel_id/ban')
  @UseGuards(AdminGuard)
  getAllChannelBannedUsers(@Param('channel_id', ParseIntPipe) channelId: number) {
    return this.channelService.findAllChannelBannedUsers(channelId);
  }

  @Post(':channel_id/ban/:user_id')
  @UseGuards(AdminGuard)
  banUser(@Param('channel_id', ChannelByIdPipe) channel: Channel, @Param('user_id', UserByIdPipe) user: User) {
    console.log(user.id);
    return this.channelService.banUser(channel, user.id);
  }

  @Delete(':channel_id/ban/:user_id')
  @UseGuards(AdminGuard)
  cancelBannedUser(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', ParseIntPipe) userId: number,
  ) {
    return this.channelService.cancelBannedUser(channelId, userId);
  }

  @Delete(':channel_id/kick/:user_id')
  @UseGuards(AdminGuard)
  kickUser(@Param('channel_id', ParseIntPipe) channelId: number, @Param('user_id', ParseIntPipe) userId: number) {
    return this.channelService.kickUser(channelId, userId);
  }

  @Put(':channel_id/admin/:user_id/give')
  @UseGuards(OwnerGuard)
  giveAdmin(@Param('channel_id', ParseIntPipe) channelId: number, @Param('user_id', ParseIntPipe) userId: number) {
    return this.channelService.updateAdmin(channelId, userId, { isAdmin: true });
  }

  @Put(':channel_id/admin/:user_id/deprive')
  @UseGuards(OwnerGuard)
  depriveAdmin(@Param('channel_id', ParseIntPipe) channelId: number, @Param('user_id', ParseIntPipe) userId: number) {
    return this.channelService.updateAdmin(channelId, userId, { isAdmin: false });
  }

  @Put(':channel_id/owner/:user_id')
  @UseGuards(OwnerGuard)
  changeOwner(@GetUser() owner: User, @Param('channel_id', ParseIntPipe) channelId: number, @Param('user_id', ParseIntPipe) successorId: number) {
    return this.channelService.changeOwner(channelId, owner.id, successorId);
  }

  @Post(':channel_id/invite/:user_id') // 뒤에 user_id 필요
  inviteUser(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Param('user_id', UserByIdPipe) invitedUser: User,
    ) {
    return this.channelService.inviteUser(channel, invitedUser);
  }

  @Post(':channel_id')
  join(
    @GetUser() user: User,
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Body() body: { providedPassword: string },
  ) {
    return this.channelService.join(user, channel, body.providedPassword);
  }


}


