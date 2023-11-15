import { User } from './../users/user.entity';

import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Channel, ChannelType } from './entities/channel.entity';
import { ChannelRelation } from './entities/channel-relation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelDto } from './dto/channel.dto';
import * as bcrypt from 'bcrypt';
import { ChannelInvitation } from './entities/channel-invitation.entity';
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

  async createChannel(owner: User, channelDto: ChannelDto) {
    const { title, password, type } = channelDto;

    let hashedPassword = null;

    if (type === ChannelType.protected) {
      if (!password) {
          throw new BadRequestException('protected 채널에는 패스워드가 필요합니다!');
      }
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
  } // protected 채널이 아니면 입력된 비밀번호를 무시


    let channel = this.channelRepository.create({ title, password: hashedPassword, type });

    channel = await this.channelRepository.save(channel);

    const channelRelation = this.channelRelationRepository.create({
      channel,
      user: owner,
      isOwner: true,
      isAdmin: true,
    });

    await this.channelRelationRepository.save(channelRelation);

    return channel;
}

  async updateChannel(channel: Channel, channelDto: ChannelDto): Promise<Channel> {
    if (channelDto.password) {
      channelDto.password = await this.hashPassword(channelDto.password);
    }
    Object.assign(channel, channelDto);

    this.checkTypeAndPassword(channel);

    return this.channelRepository.save(channel);
  }

  private async checkTypeAndPassword(channel: Channel): Promise<void> {
    if (channel.type === ChannelType.protected && !channel.password) {
      throw new BadRequestException('Protected한 채널을 생성하려면 비밀번호를 입력해주세요!');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async findAllChannels() {
    const channels = await this.channelRepository.find();
    return channels;
  }

  async findOneChannel(channelId: number) {
    const channel = await this.channelRepository.findOne({ where: { id: channelId } });

    return channel;
  }

  async exitChannel(user: User, channelId: number) {
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

  private transferOwnership(earliestOwnerRelation: ChannelRelation): void {
    earliestOwnerRelation.isOwner = true;
    this.channelRelationRepository.save(earliestOwnerRelation);
  }

  async findChannelWithMembers(channelId: number) {
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

  async findAllChannelBannedUsers(channelId: number) {
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

  async banUser(channel: Channel, userId: number) {
    const channelRelation = await this.channelRelationRepository.findOne({
      where: { channel, user: { id: userId } },
    });

    if (!channelRelation) {
      throw new NotFoundException('채널에 유저가 없습니다!');
    }

    if (channelRelation.isAdmin || channelRelation.isOwner) {
      throw new ForbiddenException('소유자나 관리자는 ban될 수 없습니다!');
    }

    if (channelRelation.isBanned) {
      throw new ForbiddenException('이미 ban된 유저입니다!');
    }

    // this.chatGateway.kickMember(channel.id, userId);
    // ban 전에 kick 처리

    channelRelation.isBanned = true;
    this.channelRelationRepository.save(channelRelation);
  }

  async cancelBannedUser(channelId: number, userId: number) {
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

  async kickUser(channelId: number, kickedUserId: number) {
    const kickedUserRelation = await this.channelRelationRepository.findOne({
      where: { channel: {id: channelId}, user: { id: kickedUserId} },
    });

    // kick되려는 유저가 채널 멤버가 맞는지 체크
    if (!kickedUserRelation) {
      throw new NotFoundException('해당 채널의 멤버가 아닙니다!');
    }

    if (kickedUserRelation.isOwner || kickedUserRelation.isAdmin) {
      throw new ForbiddenException('소유자와 관리자는 kick될 수 없습니다!');
    }

    // kick 실시간 소켓 처리
    // this.chatGateway.kickMember(channelId, kickedUserId);
    this.channelRelationRepository.remove(kickedUserRelation);
  }

  async updateAdmin(channelId: number, userId: number, updateData: {isAdmin: boolean}) {
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

  async changeOwner(channelId: number, currentOwnerId: number, successorId: number) {
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
    successorRelation.isAdmin = true;

    this.channelRelationRepository.save([currentOwnerRelation, successorRelation]);
  }

  async inviteUser(channel: Channel, invitedUser: User): Promise<ChannelInvitation> {
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

    const existingInvitation = await this.channelInvitationRepository.findOne({
        where: { channel, user: invitedUser },
    });

    if (existingInvitation) {
        throw new NotFoundException('유저가 채널에 이미 초대되었습니다!');
    }

    // 초대 기록 남기기
    const invitation = this.channelInvitationRepository.create({
        channel,
        user: invitedUser,
    });
    await this.channelInvitationRepository.save(invitation);

    // 초대된 유저를 채널 안에 입장시키기
    const newRelation = this.channelRelationRepository.create({
        channel,
        user: invitedUser,
    });
    await this.channelRelationRepository.save(newRelation);

    return invitation;
}

  async join(user: User, channel: Channel, providedPassword?: string) {
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
        throw new BadRequestException('비밀 채널입니다!');
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
