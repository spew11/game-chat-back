import { Controller, Post, Get, Put, Delete, Body, Param, Request, Query,
				 UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import {Channel} from './entities/channel.entity';

import { ChannelService } from './services/channel.service';

import { ChannelCreationDto } from './dto/post-channel.dto';
import { CreateChannelRelationDto } from './dto/post-channel-relation.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { DeleteChannelRelationDto } from './dto/delete-channel-relation.dto';
import { DeleteBannedUserDto } from './dto/delete-bannedUser.dto';
import { CreateBannedUserDto } from './dto/post-bannedUser.dto';
import { CreateMutedUserDto } from './dto/post-mutedUser.dto';


@Controller('channels')
//  @UseGuards(AuthGuard('jwt'))
export class ChannelController {
	constructor(
		private readonly channelService: ChannelService,
	) {}

	@Post()
	@UseInterceptors(ClassSerializerInterceptor)
	create(@Request() req, @Body() channelCreationDto: ChannelCreationDto) {
		console.log('channelCreationDto', channelCreationDto);
		return this.channelService.create(channelCreationDto, req.user.id);
	}

	@Put(':channel_id')
	@UseInterceptors(ClassSerializerInterceptor)
	update(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Body() updateChannelDto: UpdateChannelDto,
	  ): Promise<Channel> {
		return this.channelService.update(req.user.id, channel_id, updateChannelDto);
	}

	@Get()
	@UseInterceptors(ClassSerializerInterceptor)
	findAll() {
		return this.channelService.findAll();
	}

	@Get(':channel_id/member')
	@UseInterceptors(ClassSerializerInterceptor)
	findAllChannelMember(@Param('channel_id') channel_id: number) {
		return this.channelService.findAllChannelMember(channel_id);
	}

	@Post(':channel_id/member')
	@UseInterceptors(ClassSerializerInterceptor)
	join(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Query('password') password: string,
	  ) {
		const createChannelRelationDto: CreateChannelRelationDto = {
		  channel_id,
		  user_id: req.user.id,
		  is_admin: false,
		  password: password ? password : null,
		};
		return this.channelService.join(createChannelRelationDto);
		}

	@Delete(':channel_id/member')
	@UseInterceptors(ClassSerializerInterceptor)
	exit(@Request() req, @Param('channel_id') channel_id: number) {
		const deleteChannelRelationDto: DeleteChannelRelationDto = {
		  channel_id,
		  user_id: req.user.id,
		};
		return this.channelService.exit(deleteChannelRelationDto);
	}

	@Post(':channel_id/invite')
	@UseInterceptors(ClassSerializerInterceptor)
	invite(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Query('member_id') member_id: number,
	  ) {
		const createChannelRelationDto: CreateChannelRelationDto = {
		  channel_id,
		  user_id: member_id,
		  is_admin: false,
		  password: null,
		};
		console.log('CreateChannelRelationDto', CreateChannelRelationDto);
		return this.channelService.invite(
		  req.user.id,
		  createChannelRelationDto,
		);
	}

	@Get(':channel_id/mute')
	@UseInterceptors(ClassSerializerInterceptor)
	findAllChannelMutedMember(@Param('channel_id') channel_id: number) {
	return this.channelService.findAllChannelMutedMember(channel_id);
	}

	@Post(':channel_id/mute')
	@UseInterceptors(ClassSerializerInterceptor)
	mute(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Query('member_id') member_id: number,
	  ) {
		const user_id = req.user.id;
		const createMutedUserDto: CreateMutedUserDto = {
		  channel_id,
		  user_id: member_id,
		};
		return this.channelService.mute(createMutedUserDto, user_id);
  }

	@Get(':channel_id/ban')
	@UseInterceptors(ClassSerializerInterceptor)
	findAllChannelBannedMember(@Param('channel_id') channel_id: number) {
		return this.channelService.findAllChannelBannedMember(channel_id);
	}

	@Post(':channel_id/ban')
	@UseInterceptors(ClassSerializerInterceptor)
	ban(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Query('member_id') member_id: number,
	  ) {
		const user_id = req.user.id;
		const createBannedUserDto: CreateBannedUserDto = {
		  channel_id,
		  user_id: member_id,
		};
		return this.channelService.ban(createBannedUserDto, user_id);
	}

	@Delete(':channel_id/ban')
	@UseInterceptors(ClassSerializerInterceptor)
	deleteChannelBannedMember(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Query('member_id') member_id: number,
	  ) {
		const user_id = req.user.id;
		const deleteBannedUserDto: DeleteBannedUserDto = {
		  channel_id,
		  user_id: member_id,
		};
		console.log('user_id', user_id);
		console.log('deleteBannedUserDto', deleteBannedUserDto);

		return this.channelService.deleteChannelBannedMember(
		  user_id,
		  deleteBannedUserDto,
		);
	}

	@Delete(':channel_id/kick')
	@UseInterceptors(ClassSerializerInterceptor)
	kick(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Query('member_id') member_id: number,
	  ) {
		return this.channelService.kick(req.user.id, channel_id, member_id);
	}

	@Get(':channel_id/admin')
	@UseInterceptors(ClassSerializerInterceptor)
	checkChannelAdmin(@Request() req, @Param('channel_id') channel_id: number) {
		return this.channelService.checkChannelAdmin(req.user.id, channel_id);
	}

	@Put(':channel_id/admin')
	@UseInterceptors(ClassSerializerInterceptor)
	updateChannelAdmin(
		@Request() req,
		@Param('channel_id') channel_id: number,
		@Query('member_id') member_id: number,
	  ) {
		return this.channelService.updateChannelAdmin(
		  req.user.id,
		  channel_id,
		  member_id,
		);
	}
}
