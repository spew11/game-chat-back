import { ChannelByIdPipe } from './../pipes/ChannelById.Pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
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

  @Get('me')
  async getChannelsByUser(@GetUser() user: User): Promise<any[]> {
    const channelRelations = await this.channelService.findChannelsByUser(user.id);
    return channelRelations.map((relation) => ({
      channel: relation.channel,
      role: relation.isOwner ? 'Owner' : relation.isAdmin ? 'Admin' : 'User',
    }));
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
  getOneChannelWithUsers(@Param('channel_id', ParseIntPipe) channelId: number): Promise<Channel> {
    return this.channelService.findOneChannelWithUsers(channelId);
  }

  @Get()
  getAllChannels(): Promise<Channel[]> {
    return this.channelService.findAllChannels();
  }

  @Delete(':channel_id')
  exitChannel(
    @GetUser() user: User,
    @Param('channel_id', ParseIntPipe) channelId: number,
  ): Promise<void> {
    return this.channelService.exitChannel(user, channelId);
  }

  @Get(':channel_id/ban')
  @UseGuards(AdminGuard)
  getAllChannelBannedUsers(@Param('channel_id', ParseIntPipe) channelId: number): Promise<User[]> {
    return this.channelService.findAllChannelBannedUsers(channelId);
  }

  @Post(':channel_id/ban/:user_id')
  @UseGuards(AdminGuard)
  banUser(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', UserByIdPipe) userToBan: User,
    @GetUser() actingUser: User,
  ): Promise<void> {
    return this.channelService.banUser(channelId, userToBan.id, actingUser.id);
  }

  @Delete(':channel_id/ban/:user_id')
  @UseGuards(AdminGuard)
  cancelBannedUser(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.channelService.cancelBannedUser(channelId, userId);
  }

  @Delete(':channel_id/kick/:user_id')
  @UseGuards(AdminGuard)
  kickUser(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', UserByIdPipe) userToKick: User,
    @GetUser() actingUser: User,
  ) {
    return this.channelService.kickUser(channelId, userToKick.id, actingUser.id);
  }

  @Put(':channel_id/admin/:user_id/give')
  @UseGuards(OwnerGuard)
  giveAdmin(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.channelService.updateAdmin(channelId, userId, { isAdmin: true });
  }

  @Put(':channel_id/admin/:user_id/deprive')
  @UseGuards(OwnerGuard)
  depriveAdmin(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.channelService.updateAdmin(channelId, userId, { isAdmin: false });
  }

  @Put(':channel_id/owner/:user_id')
  @UseGuards(OwnerGuard)
  changeOwner(
    @GetUser() owner: User,
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', ParseIntPipe) successorId: number,
  ): Promise<void> {
    return this.channelService.changeOwner(channelId, owner.id, successorId);
  }

  @Post(':channel_id/invite/:user_id')
  inviteUser(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Param('user_id', UserByIdPipe) invitedUser: User,
    @GetUser() actingUser: User,
  ): Promise<ChannelInvitation> {
    return this.channelService.inviteUser(channel, invitedUser, actingUser);
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

  @Post(':channel_id/mute/:user_id')
  @UseGuards(AdminGuard)
  muteUser(
    @Param('channel_id', ParseIntPipe) channelId: number,
    @Param('user_id', UserByIdPipe) userToMute: User,
    @GetUser() actingUser: User,
  ): Promise<void> {
    return this.channelService.muteUser(channelId, userToMute.id, actingUser.id);
  }
}
