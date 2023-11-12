import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChannelsService } from './channels.service';

interface User {
	socket: Socket;
	id: number;
	name: string;
}

interface MutedMember {
	id: number;
	mutedTime: number;
	createdAt: Date;
}

interface Channel {
	connectedMembers: Map<number, User>;
	mutedMembers: Map<number, MutedMember>;
}

@Injectable()
export class ChatService {
  constructor(
    private channelService: ChannelsService,
  ) {}

  private channels: Map<string, Channel> = new Map<string, Channel>();

  async initChannels(channel_id: string) {
    const channel = await this.channelService.findOneChannel(parseInt(channel_id));
    if (!channel) throw new NotFoundException('채널이 존재하지 않습니다!');

    if (!this.channels[channel_id]) {
      this.channels[channel_id] = {
        connectedMembers: new Map<number, User>(),
        mutedMembers: new Map<number, MutedMember>()
      };
    }

		channel.channelRelations.forEach((channelMutedUser) => {
			const mutedMember: MutedMember = {
				id: channelMutedUser.user.id,
				mutedTime: channelMutedUser.mutedTime,
				createdAt: channelMutedUser.muteCreatedAt,
			};
			this.channels[channel_id].mutedMembers.set(
				channelMutedUser.user.id,
				mutedMember,
			);
    });
  }

  async addConnectedMember(channel_id: string, user_id: number, socket: Socket) {
    const member = await this.channelService.findOneChannelUser(
      parseInt(channel_id),
      user_id,
    );
    if (!member)
      throw new NotFoundException('채널에 참여하지 않은 유저입니다!');

    this.channels[channel_id].connectedMembers.set(user_id, {
      socket: socket,
      id: member.user.id,
      name: member.user.nickname,
    });
    return member;
	}

  removeConnectedMember(channel_id: string, user_id: number) {
    if (!this.channels[channel_id]) return;
    this.channels[channel_id].connectedMembers.delete(user_id);
  }

  getMemberInChannel(channel_id: string, user_id: number) {
    if (!this.channels[channel_id]) return null;
    return this.channels[channel_id].connectedMembers.get(user_id);
  }

  getConnectedMembers(channel_id: string) {
    if (!this.channels[channel_id]) return null;

    const connectedMembers = this.channels[channel_id].connectedMembers;
    const membersInfo = [];
    connectedMembers.forEach((member) => {
      membersInfo.push({
        id: member.id,
        name: member.name,
      });
    });
    return membersInfo;
  }

  addMutedMember(
    channel_id: number,
    user_id: number,
    mutedTime: number,
    createdAt: Date,
  ) {
    const channel = this.channels[channel_id.toString()];
    let mutedMember = channel.mutedMembers.get(user_id);

    if (!mutedMember) {
      mutedMember = { id: user_id, mutedTime, createdAt };
      channel.mutedMembers.set(user_id, mutedMember);
    } else {
      mutedMember.createdAt = createdAt;
    }
  }

  isMutedMember(channel_id: string, user_id: number): boolean {
    const mutedMember = this.channels[channel_id].mutedMembers.get(user_id);
    if (!mutedMember) return false;
    if (this.isExpiredMutedTime(mutedMember)) {
      return false;
    }
    return true;
  }

  isExpiredMutedTime(mutedMember): boolean {
    const mutedTime: number = mutedMember.mutedTime * 60000;
    const createdAt: Date = mutedMember.createdAt;
    const now: Date = new Date();
    const diff: number = now.getTime() - createdAt.getTime();

    if (diff >= mutedTime) return true; // 5분이 경과하면
    return false;
  }

	removeMutedMember(channelId: string, userId: number) {
		if (this.channels[channelId]) {
			const mutedMember = this.channels[channelId].mutedMembers.get(userId);
			if (mutedMember) {
				this.channelService.unmuteUser(parseInt(channelId), userId);
				// muted 유저 제거
				this.channels[channelId].mutedMembers.delete(userId);
			}
		}
	}

  async findConnectedMember(channel_id: string, user_id: number) {
    const channel = this.channels[channel_id];
    if (!channel) return null;
    return channel.connectedMembers.get(user_id);
  }
}
