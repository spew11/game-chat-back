import { ChannelByIdPipe } from './../pipes/ChannelById.Pipe';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/user.entity';
import { ChannelDto } from './dto/channel.dto';
import { Channel } from './entities/channel.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}

  @Post()
  createChannel(@GetUser() user: User, @Body() channelDto: ChannelDto) {
    return this.channelService.createChannel(user, channelDto);
  }

  @Put(':channel_id')
  // ownerGuard
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
  // adminguard
  getAllChannelBannedUsers(@Param('channel_id', ParseIntPipe) channelId: number) {
    return this.channelService.findAllChannelBannedUsers(channelId);
  }

  @Post(':channel_id/ban/:user_id')
  // adminguard
  banUser(@Param('channel_id', ChannelByIdPipe) channel: Channel, @Param('user_id', UserByIdPipe) userId: number) {
    return this.channelService.banUser(channel, userId);
  }

  @Delete(':channel_id/ban/:user_id')
  // adminguard
  cancelBannedUser(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', ParseIntPipe) userId: number,
  ) {
    return this.channelService.cancelBannedUser(channelId, userId);
  }

  @Delete(':channel_id/kick/:user_id')
  // adminguard
  kickUser(@Param('channel_id', ParseIntPipe) channelId: number, @Param('user_id', ParseIntPipe) userId: number) {
    return this.channelService.kickUser(channelId, userId);
  }

  @Put(':channel_id/admin/:user_id/give')
  // ownerguard
  giveAdmin(@Param('channel_id', ParseIntPipe) channelId: number, @Param('user_id', ParseIntPipe) userId: number) {
    return this.channelService.updateChannelRelation(channelId, userId, { isAdmin: true });
  }

  @Put(':channel_id/admin/:user_id/deprive')
  // ownerguard
  depriveAdmin(@Param('channel_id', ParseIntPipe) channelId: number, @Param('user_id', ParseIntPipe) userId: number) {
    return this.channelService.updateChannelRelation(channelId, userId, { isAdmin: false });
  }

  @Put(':channel_id/owner/:user_id')
  // ownerguard
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
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Body() body: { providedPassword: string },
  ) {
    return this.channelService.join(user, channelId, body.providedPassword);
  }

  @Post(':channel_id/mute/:user_id')
  // adminGuard
    muteUser(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', ParseIntPipe) userId: number,
  ) {
    return this.channelService.muteUser(channelId, userId);
  }


}


