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
import { ChannelInfoDto } from './dto/channel-info.dto';
import { ChannelRoleDto } from './dto/channel-role.dto';
import { ChannelWithUsersDto } from './dto/channel-with-user.dto';
import { ChannelInvitationDto } from './dto/channel-invitation.dto';
import { ShowUserIdDto } from 'src/user-relation/dtos/show-user-id.dto';

@UseGuards(AuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}

  @Post()
  async createChannel(
    @GetUser() user: User,
    @Body() channelDto: ChannelDto,
  ): Promise<ChannelInfoDto> {
    const newChannel = await this.channelService.createChannel(user, channelDto);

    return {
      id: newChannel.id,
      title: newChannel.title,
      type: newChannel.type,
    };
  }

  @Get('me')
  async getChannelsByUser(@GetUser() user: User): Promise<ChannelRoleDto[]> {
    const channelRelations = await this.channelService.findChannelsByUser(user.id);

    return channelRelations.map((relation) => {
      return {
        id: relation.channel.id,
        title: relation.channel.title,
        type: relation.channel.type,
        role: relation.isOwner ? 'Owner' : relation.isAdmin ? 'Admin' : 'User',
      };
    });
  }

  @Put(':channel_id')
  @UseGuards(OwnerGuard)
  async updateChannel(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Body() channelDto: ChannelDto,
  ): Promise<ChannelInfoDto> {
    const updatedChannel = await this.channelService.updateChannel(channel, channelDto);

    return {
      id: updatedChannel.id,
      title: updatedChannel.title,
      type: updatedChannel.type,
    };
  }

  @Get(':channel_id')
  async getOneChannelWithUsers(
    @Param('channel_id', ParseIntPipe) channelId: number,
  ): Promise<ChannelWithUsersDto> {
    const channelWithUsers = await this.channelService.findOneChannelWithUsers(channelId);

    const usersWithMuteStatus = channelWithUsers.channelRelations.map((relation) => {
      return {
        id: relation.user.id,
        nickname: relation.user.nickname,
        role: relation.isOwner ? 'Owner' : relation.isAdmin ? 'Admin' : 'User',
        isMuted: relation.isMuted,
      };
    });

    return {
      id: channelWithUsers.id,
      title: channelWithUsers.title,
      type: channelWithUsers.type,
      users: usersWithMuteStatus,
    };
  }

  @Get()
  async getAllChannels(): Promise<ChannelInfoDto[]> {
    const channels = await this.channelService.findAllChannels();

    return channels.map((channel) => ({
      id: channel.id,
      title: channel.title,
      type: channel.type,
    }));
  }

  @Delete(':channel_id')
  exitChannel(
    @GetUser() user: User,
    @Param('channel_id', ParseIntPipe) channelId: number,
  ): Promise<void> {
    return this.channelService.exitChannel(user, channelId);
  }

  @Get(':channel_id/ban')
  async getAllChannelBannedUsers(
    @Param('channel_id', ParseIntPipe) channelId: number,
  ): Promise<ShowUserIdDto[]> {
    const bannedUsers = await this.channelService.findAllChannelBannedUsers(channelId);

    return bannedUsers.map((user) => ({
      id: user.id,
      nickname: user.nickname,
    }));
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
  async inviteUser(
    @Param('channel_id', ChannelByIdPipe) channel: Channel,
    @Param('user_id', UserByIdPipe) invitedUser: User,
    @GetUser() actingUser: User,
  ): Promise<ChannelInvitationDto> {
    const invitation = await this.channelService.inviteUser(channel, invitedUser, actingUser);

    return {
      user: {
        id: invitation.user.id,
        nickname: invitation.user.nickname,
      },
      channel: {
        id: invitation.channel.id,
        title: invitation.channel.title,
        type: invitation.channel.type,
      },
    };
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
