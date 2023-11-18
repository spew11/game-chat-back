import { User } from './../users/user.entity';

import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Channel, ChannelType } from './entities/channel.entity';
import { ChannelRelation } from './entities/channel-relation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelDto } from './dto/channel.dto';
import * as bcrypt from 'bcrypt';
import { ChannelInvitation, InvitationStatus } from './entities/channel-invitation.entity';
// import { ChatService } from './channels-chat.service';
// import { ChatGateway } from './channels.gateway';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelRelation)
    private channelRelationRepository: Repository<ChannelRelation>,
    @InjectRepository(ChannelInvitation)
    private channelInvitationRepository: Repository<ChannelInvitation>,
    // @Inject(forwardRef(() => ChatService))
    // private readonly chatService: ChatService,
    // @Inject(forwardRef(() => ChatGateway))
    // private readonly chatGateway: ChatGateway,
  ) { }

  async createChannel(owner: User, channelDto: ChannelDto): Promise<Channel> {
    const { title, password, type } = channelDto;

    let hashedPassword = null;

    if (type === ChannelType.protected) {
      hashedPassword = await this.hashPassword(password);
  } // protected 채널이 아니면 입력된 비밀번호를 무시

    let channel = this.channelRepository.create({ title, password: hashedPassword, type });

    channel = await this.channelRepository.save(channel);

    const channelRelation = this.channelRelationRepository.create({
      channel,
      user: owner,
      isOwner: true,
      isAdmin: false,
    });

    await this.channelRelationRepository.save(channelRelation);

    return channel;
}

  async updateChannel(channel: Channel, channelDto: ChannelDto): Promise<Channel> {
    if (channelDto.type === ChannelType.protected) {
      channelDto.password = await this.hashPassword(channelDto.password);
    } else {
      // protected 채널이 아니면
      channelDto.password = null;
    }

    Object.assign(channel, channelDto);

    return this.channelRepository.save(channel);
  }

  private async hashPassword(password: string): Promise<string> {
    if (!password || password.length < 4) {
      throw new BadRequestException('protected 채널에는 최소 4자 이상의 비밀번호가 필요합니다!');
    }
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async findAllChannels(): Promise<Channel[]> {
    const channels = await this.channelRepository.find();
    return channels;
  }

  async findOneChannel(channelId: number): Promise<Channel>  {
    const channel = await this.channelRepository.findOne({ where: { id: channelId } });

    return channel;
  }

  async exitChannel(user: User, channelId: number): Promise<void> {
    let ifTranferNeeded = false;
    const channelRelation = await this.channelRelationRepository.findOne({
      where: { user, channel: { id: channelId } },
    });

    if (!channelRelation) {
      throw new NotFoundException('해당 채널의 멤버가 아닙니다!');
    }

    if (channelRelation.isOwner) {
      ifTranferNeeded = true;
    }

    // 채널에서 유저 삭제
    await this.channelRelationRepository.remove(channelRelation);

    if (ifTranferNeeded) {
      // 채널에 남은 유저 있는지 확인.
      const earliestOwnerRelation = await this.channelRelationRepository.findOne({
        where: { channel: { id: channelId } },
        order: { createdAt: 'ASC' },
      });

      if (earliestOwnerRelation) {
        // 마지막 사람이 나갈 때 남은 유저가 없다면 채널 삭제
        this.transferOwnership(earliestOwnerRelation);
      } else {
        this.channelRepository.delete(channelId);
      }
    }
  }

  private async transferOwnership(earliestOwnerRelation: ChannelRelation): Promise<void> {
    earliestOwnerRelation.isOwner = true;
    this.channelRelationRepository.save(earliestOwnerRelation);
  }

  async findChannelWithMembers(channelId: number): Promise<Channel>  {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: {
        channelRelations: {
          user: true
        }
      }
    });

    return channel;
  }

  async findAllChannelBannedUsers(channelId: number): Promise<User[]> {
    const bannedUsers = await this.channelRelationRepository.find({
      where: {
        channel: { id: channelId },
        isBanned: true,
      },
      relations: ['user'],
    });

    return bannedUsers.map((relation) => relation.user);
    // ChannelRelation entity를 User entity 형태로 리턴하기 위해 map 메소드 사용
  }

  async banUser(channel: Channel, userId: number): Promise<void> {
    const channelRelation = await this.channelRelationRepository.findOne({
      where: { channel, user: { id: userId } },
    });

    if (!channelRelation) {
      throw new NotFoundException('채널에 유저가 없습니다!');
    }

    if (channelRelation.isOwner) {
      throw new ForbiddenException('소유자는 ban될 수 없습니다!');
    }

    if (channelRelation.isBanned) {
      throw new ForbiddenException('이미 ban된 유저입니다!');
    }

    // this.chatGateway.kickMember(channel.id, userId);
    // ban 전에 kick 처리

    channelRelation.isBanned = true;
    this.channelRelationRepository.save(channelRelation);
  }

  async cancelBannedUser(channelId: number, userId: number): Promise<void> {
    const channelRelation = await this.channelRelationRepository.findOne({
      where: {
        channel: {id: channelId},
        user: { id: userId },
        isBanned: true
      },
    });

    if (!channelRelation) {
      throw new NotFoundException('Banned된 유저가 채널에 없습니다!');
    }

    this.channelRelationRepository.remove(channelRelation);
  }

  async kickUser(channelId: number, kickedUserId: number): Promise<void> {
    const kickedUserRelation = await this.channelRelationRepository.findOne({
      where: { channel: {id: channelId}, user: { id: kickedUserId} },
    });

    // kick되려는 유저가 채널 멤버가 맞는지 체크
    if (!kickedUserRelation) {
      throw new NotFoundException('해당 채널의 멤버가 아닙니다!');
    }

    if (kickedUserRelation.isOwner) {
      throw new ForbiddenException('소유자는 kick될 수 없습니다!');
    }

    // kick 실시간 소켓 처리
    // this.chatGateway.kickMember(channelId, kickedUserId);
    this.channelRelationRepository.remove(kickedUserRelation);
  }

  async updateAdmin(channelId: number, userId: number, updateData: {isAdmin: boolean}): Promise<void> {
    const requestedUserRelation = await this.channelRelationRepository.findOne({
      where: {
        channel: {id: channelId},
        user: { id: userId },
        isBanned: false
     },
    });

    if (!requestedUserRelation) {
      throw new NotFoundException(`채널과 유저가 없습니다!}.`);
    }

    if (requestedUserRelation.isOwner) {
      throw new ForbiddenException('채널 소유자의 권한을 변경할 수 없습니다!');
    }

    requestedUserRelation.isAdmin = updateData.isAdmin;
    this.channelRelationRepository.save(requestedUserRelation);
  }

  async changeOwner(channelId: number, currentOwnerId: number, successorId: number): Promise<void> {

    if (currentOwnerId === successorId) {
      return; // owner가 자신에게 소유권을 부여할 시
    }
    // 현 소유자 찾기
    const currentOwnerRelation = await this.channelRelationRepository.findOneBy({
      channel: {id: channelId},
      user: {id: currentOwnerId},
      isOwner: true,
    })

    if (!currentOwnerRelation) {
      throw new ForbiddenException('채널의 소유자가 아닙니다!');
    }

    // 소유자를 계승할 유저 찾기
    const successorRelation = await this.channelRelationRepository.findOneBy({
      channel: {id: channelId},
      user: {id: successorId},
      isBanned: false,
    })

    if (!successorRelation) {
      throw new NotFoundException('유저가 채널에 없습니다!');
    }

    currentOwnerRelation.isOwner = false;
    successorRelation.isOwner = true;

    this.channelRelationRepository.save([currentOwnerRelation, successorRelation]);
  }

  async inviteUser(channel: Channel, invitedUser: User): Promise<ChannelInvitation> {

    if (channel.type !== ChannelType.private) {
      throw new BadRequestException('private 채널에서만 초대가 허용됩니다!');
    }

    const userRelation = await this.channelRelationRepository.findOne({
        where: { channel, user: invitedUser },
    });
     // 유저가 밴된 유저인지 체크

    if (userRelation && userRelation.isBanned) {
        throw new ForbiddenException('banned돼서 초대할 수 없는 유저입니다!');
    }

    if (userRelation) {
        throw new BadRequestException('유저가 이미 채널의 멤버입니다!');
    }

    // 이미 초대되었는지 확인
    let existingInvitation = await this.channelInvitationRepository.findOne({
      where: { channel, user: invitedUser },
    });

    if (existingInvitation && existingInvitation.status === InvitationStatus.Refused) {
      existingInvitation = this.channelInvitationRepository.merge(existingInvitation, { status: InvitationStatus.Waiting });
      await this.channelInvitationRepository.save(existingInvitation);
      return existingInvitation;
    }
    // 유저가 이전에 초대되었지만 refuse했던 경우 status를 waiting으로 수정

    if (!existingInvitation || existingInvitation.status === InvitationStatus.Accepted) {
      const newInvitation = this.channelInvitationRepository.create({
          channel,
          user: invitedUser,
          status: InvitationStatus.Waiting
      });
      return await this.channelInvitationRepository.save(newInvitation);
    }
    // 존재하는 초대가 없거나 이전에 초대를 수락했으면 초대 기록 남기기

    throw new NotFoundException('유저가 채널에 이미 초대되었습니다!');
    // 유저가 수락 거절 반응을 기다리고 있을 때 나오는 메시지
}

  async acceptInvitation(userId: number, channelId: number): Promise<void> {
    const invitation = await this.channelInvitationRepository.findOne({
        where: { user: { id: userId }, channel: { id: channelId } }
    });

    if (!invitation) {
        throw new NotFoundException('Invitation이 없습니다!');
    }

    invitation.status = InvitationStatus.Accepted;
    await this.channelInvitationRepository.save(invitation);
  }

  async refuseInvitation(userId: number, channelId: number): Promise<void> {
    const invitation = await this.channelInvitationRepository.findOne({
        where: { user: { id: userId }, channel: { id: channelId } }
    });

    if (!invitation) {
        throw new NotFoundException('Invitation이 없습니다!');
    }

    invitation.status = InvitationStatus.Refused;
    await this.channelInvitationRepository.save(invitation);
  }

  async join(user: User, channel: Channel, providedPassword?: string): Promise<void> {
    const existingRelation = await this.channelRelationRepository.findOne({
      where: { channel, user },
    });

    if (existingRelation) {
      if (existingRelation.isBanned) {
        throw new ForbiddenException('채널에서 banned된 유저입니다!');
      }
      throw new BadRequestException('이미 채널의 멤버입니다!');
    }

    if (channel.type === ChannelType.private) {
      const channelInvitation = await this.channelInvitationRepository.findOneBy({
        channel,
        user,
      });
      if (!channelInvitation) {
        throw new BadRequestException('비밀 채널입니다 또는 초대가 없습니다!');
      }

      if (channelInvitation.status === InvitationStatus.Refused) {
          throw new ForbiddenException('초대를 거부한 채널에는 입장할 수 없습니다!');
      }

      if (channelInvitation.status !== InvitationStatus.Accepted) {
          throw new BadRequestException('초대를 수락하지 않았습니다!');
      }
    } else if (channel.type === ChannelType.protected) {
      if (!providedPassword) {
        throw new BadRequestException('비밀번호를 입력하세요!');
      }
      const isPasswordValid = await bcrypt.compare(providedPassword, channel.password);
      if (!isPasswordValid) {
        throw new ForbiddenException('패스워드가 틀립니다!');
      }
    }

    const newRelation = this.channelRelationRepository.create({
      channel,
      user,
    });
    await this.channelRelationRepository.save(newRelation);
  }

  async findOneChannelUser(channelId: number, userId: number): Promise<ChannelRelation> {
    const channelUser = await this.channelRelationRepository.findOne({
      where: { user: { id: userId }, channel: { id: channelId } },
    });

    if (!channelUser) {
      throw new NotFoundException('유저를 찾지 못 했습니다!');
    }

    return channelUser;
  }

  async findChannelRelation(channelId: number, userId: number): Promise<ChannelRelation> {
    return this.channelRelationRepository.findOne({
      where: {
        channel: { id: channelId },
        user: { id: userId }
      }
    });
  }

  // async muteUser(channelId: number, userId: number): Promise<boolean> {
  //   const channel = await this.channelRepository.findOne({ where: { id: channelId } });

  //   if (!channel) {
  //     throw new NotFoundException('채널을 찾을 수 없습니다!');
  //   }

  //   const channelRelation = await this.channelRelationRepository.findOne({
  //     where: { channel, user: { id: userId } },
  //   });

  //   if (!channelRelation) {
  //     throw new NotFoundException('유저가 채널의 멤버가 아닙니다!');
  //   }

  //   if (channelRelation.isOwner) {
  //     throw new ForbiddenException('소유자는 mute될 수 없습니다!');
  //   }

  //   if (channelRelation.isMuted) {
  //     throw new BadRequestException('이미 유저가 muted된 상태입니다!');
  //   }

  //   channelRelation.isMuted = true;
  //   channelRelation.muteCreatedAt = new Date();

  //   await this.channelRelationRepository.save(channelRelation);

  //   return true;
  // }

  // async unmuteUser(channelId: number, userId: number): Promise<boolean> {
  //   const channel = await this.channelRepository.findOne({ where: { id: channelId } });

  //   if (!channel) {
  //     throw new NotFoundException('채널을 찾을 수 없습니다!');
  //   }

  //   const channelRelation = await this.channelRelationRepository.findOne({
  //     where: { channel, user: { id: userId } },
  //   });

  //   if (!channelRelation) {
  //     throw new NotFoundException('유저가 채널의 멤버가 아닙니다!');
  //   }

  //   if (!channelRelation.isMuted) {
  //     throw new BadRequestException('유저가 이미 unmuted된 상태입니다.');
  //   }

  //   channelRelation.isMuted = false;
  //   channelRelation.muteCreatedAt = null;

  //   await this.channelRelationRepository.save(channelRelation);

  //   this.chatService.addMutedMember(
  //     channelId,
  //     userId,
  //     0, // mutedTime 0
  //     null // createdAt null
  //   );

  //   return true;
  // }

}
