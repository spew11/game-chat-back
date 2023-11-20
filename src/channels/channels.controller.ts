import { ChannelByIdPipe } from './../pipes/ChannelById.Pipe';
import { Body, Controller, Delete, Get, Param,  Post, Put, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { GetUser } from 'src/auth/user.decorator';
import { User } from 'src/users/user.entity';
import { ChannelDto } from './dto/channel.dto';
import { Channel } from './entities/channel.entity';
import { UserByIdPipe } from 'src/pipes/UserById.pipe';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard, OwnerGuard } from './channels.guard';
import { ChannelInvitation } from './entities/channel-invitation.entity';

@UseGuards(AuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}

  @Post()
  createChannel(@GetUser() user: User, @Body() channelDto: ChannelDto): Promise<Channel> {
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
  getOneChannel(@Param('channel_id', ChannelByIdPipe) channel: Channel): Promise<Channel> {
    return this.channelService.findOneChannel(channel.id);
  }

  @Get()
  getAllChannels(): Promise<Channel[]> {
    return this.channelService.findAllChannels();
  }

  @Delete(':channel_id')
  exitChannel(@GetUser() user: User, @Param('channel_id', ChannelByIdPipe) channel: Channel): Promise<void> {
    return this.channelService.exitChannel(user, channel.id);
  }

  @Get(':channel_id/ban')
  @UseGuards(AdminGuard)
  getAllChannelBannedUsers(@Param('channel_id', ChannelByIdPipe) channel: Channel): Promise<User[]> {
    return this.channelService.findAllChannelBannedUsers(channel.id);
  }

  @Post(':channel_id/ban/:user_id')
  @UseGuards(AdminGuard)
  async banUser(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Param('user_id', UserByIdPipe) userToBan: User,
    @GetUser() actingUser: User
  ): Promise<void> {
    return this.channelService.banUser(channel.id, userToBan.id, actingUser.id);
  }

  @Delete(':channel_id/ban/:user_id')
  @UseGuards(AdminGuard)
  cancelBannedUser(@Param('channel_id', ChannelByIdPipe) channel: Channel, @Param('user_id', UserByIdPipe) user: User): Promise<void> {
    return this.channelService.cancelBannedUser(channel.id, user.id);
  }

  @Delete(':channel_id/kick/:user_id')
  @UseGuards(AdminGuard)
  async kickUser(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Param('user_id', UserByIdPipe) userToKick: User,
    @GetUser() actingUser: User
  ) {
    return this.channelService.kickUser(channel.id, userToKick.id, actingUser.id);
  }

  @Put(':channel_id/admin/:user_id/give')
  @UseGuards(OwnerGuard)
  giveAdmin(@Param('channel_id', ChannelByIdPipe) channel: Channel, @Param('user_id', UserByIdPipe) user: User): Promise<void> {
    return this.channelService.updateAdmin(channel.id, user.id, { isAdmin: true });
  }

  @Put(':channel_id/admin/:user_id/deprive')
  @UseGuards(OwnerGuard)
  depriveAdmin(@Param('channel_id', ChannelByIdPipe) channel: Channel, @Param('user_id', UserByIdPipe) user: User): Promise<void> {
    return this.channelService.updateAdmin(channel.id, user.id, { isAdmin: false });
  }

  @Put(':channel_id/owner/:user_id')
  @UseGuards(OwnerGuard)
  changeOwner(@GetUser() owner: User, @Param('channel_id', ChannelByIdPipe) channel: Channel, @Param('user_id', UserByIdPipe) successorId: User): Promise<void> {
    return this.channelService.changeOwner(channel.id, owner.id, successorId.id);
  }

  @Post(':channel_id/invite/:user_id')
  inviteUser(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Param('user_id', UserByIdPipe) invitedUser: User,
    ): Promise<ChannelInvitation> {
    return this.channelService.inviteUser(channel, invitedUser);
  }

  @Post(':channel_id/accept-invite')
  acceptInvitation(
    @GetUser() user: User,
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
  ): Promise<void> {
    return this.channelService.acceptInvitation(user.id, channel.id);
  }

  @Post(':channel_id/refuse-invite')
  refuseInvitation(
    @GetUser() user: User,
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
  ): Promise<void> {
    return this.channelService.refuseInvitation(user.id, channel.id);
  }

  @Post(':channel_id')
  join(
    @GetUser() user: User,
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Body() body: { providedPassword: string },
  ): Promise<void> {
    return this.channelService.join(user, channel, body.providedPassword);
  }

  @Get('me')
  async getChannelsByUser(@GetUser() user: User): Promise<any[]> {
    return this.channelService.findChannelsByUser(user);
  }


}


