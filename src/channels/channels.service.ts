import { GetUser } from 'src/auth/user.decorator';
import { User } from './../users/user.entity';

import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Channel, ChannelType } from './entities/channel.entity';
import { ChannelRelation } from './entities/channel-relation.entity';
import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelDto } from './dto/channel.dto';
import * as bcrypt from 'bcrypt';
import { ChannelInvitation } from './entities/channel-invitation.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelRelation)
    private channelRelationRepository: Repository<ChannelRelation>,
    @InjectRepository(ChannelInvitation)
    private channelInvitationRepository: Repository<ChannelInvitation>,
  ) { }

  async createChannel(owner: User, channelDto: ChannelDto) {
    // transaction 추가

    const { title, password, type } = channelDto;

    if (password) {
      const salt = await bcrypt.genSalt();
      channelDto.password = await bcrypt.hash(password, salt);
    }

    const channel = this.channelRepository.create({ title, password, type, user: owner });
    await this.channelRepository.save(channel);

    const channelRelation = this.channelRelationRepository.create({
      channel,
      user: owner,
      isOwner: true,
      isAdmin: true,
    });
    this.channelRelationRepository.save(channelRelation);

    return channel;
  }

  async updateChannel(channel: Channel, channelDto: ChannelDto): Promise<Channel> {
    this.checkTypeAndPassword(channel, channelDto);

    if (channelDto.password) {
      channelDto.password = await this.hashPassword(channelDto.password);
    }

    if (channelDto.title) {
      channel.title = channelDto.title;
    }

    Object.assign(channel, channelDto);

    return this.channelRepository.save(channel);
  }

  private async checkTypeAndPassword(channel: Channel, channelDto: ChannelDto): Promise<void> {
    if (channel.type === ChannelType.protected && !channelDto.password) {
      throw new BadRequestException('Protected한 채널을 생성하려면 비밀번호를 입력해주세요!');
    }
  } // 메소드 분리

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

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

    return channel;
  }


  async exitChannel(user: User, channelId: number): Promise<boolean> {
    const channelRelation = await this.channelRelationRepository.findOne({
      where: { user, channel: { id: channelId } as any },
    });

    if (!channelRelation) {
      throw new NotFoundException('해당 채널의 멤버가 아닙니다!');
    }

    // 나가려는 유저가 owner면 가장 먼저 접속한 유저에게 방장 위임 후 퇴장
    if (channelRelation.isOwner) {
      await this.transferOwnership(channelId);
    }

    await this.channelRelationRepository.remove(channelRelation);

    const remainingUsers = await this.channelRelationRepository.find({
      where: { channel: { id: channelId } },
    });

    if (remainingUsers.length === 0) {
      // 마지막 사람이 나갈 때 남은 유저가 없다면 채널 삭제
      await this.channelRepository.delete(channelId);
    }

    return true;
  }

  private async transferOwnership(channelId: number): Promise<void> {
    const earliestOwnerRelation = await this.channelRelationRepository.find({
        where: { channel: { id: channelId } },
        order: { createdAt: 'ASC' },
        take: 1,
    });

      if (earliestOwnerRelation.length > 0) {
        const earliestOwner = earliestOwnerRelation[0];
        earliestOwner.isOwner = true;
        await this.channelRelationRepository.save(earliestOwner);
      } else {
        throw new NotFoundException('소유자를 위임할 유저가 없습니다!');
      }
  }

  async findChannelWithMembers(channelId: number) {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['channelRelations', 'channelRelations.user'],
    });

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

    return channel;
  }

  async findAllChannelBannedUsers(channelId: number) {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['channelRelations', 'channelRelations.user'],
    });

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

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

  async banUser(channel: Channel, userId: number): Promise<boolean> {
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
      return false;
    }

    channelRelation.isBanned = true;
    await this.channelRelationRepository.save(channelRelation);
    // 추후 소켓으로 먼저 kick 처리 후 isBanned 정보 저장

    return true;
  }

  async cancelBannedUser(channelId: number, userId: number): Promise<boolean> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

    const channelRelation = await this.channelRelationRepository.findOne({
      where: { channel, user: { id: userId }, isBanned: true },
    });

    if (!channelRelation) {
      throw new NotFoundException('Banned된 유저가 채널에 없습니다!');
    }

    channelRelation.isBanned = false;
    await this.channelRelationRepository.save(channelRelation);

    return true;
  }

  async kickUser(channelId: number, kickedUserId: number): Promise<boolean> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

    const kickedUserRelation = await this.channelRelationRepository.findOne({
      where: { channel, user: { id: kickedUserId} },
    });

    // kick되려는 유저가 채널 멤버가 맞는지 체크
    if (!kickedUserRelation) {
      throw new NotFoundException('해당 채널의 멤버가 아닙니다!');
    }

    if (kickedUserRelation.isOwner) {
      throw new ForbiddenException('소유자는 kick될 수 없습니다!');
    }

    await this.channelRelationRepository.remove(kickedUserRelation);
    // 추후 소켓으로 kickmember 처리

    return true;
  }

  async updateChannelRelation(channelId: number, userId: number, updateData: { isAdmin: boolean }): Promise<boolean> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

    const requestedUserRelation = await this.channelRelationRepository.findOne({
      where: { channel, user: { id: userId } },
    });

    if (requestedUserRelation.isOwner) {
      throw new ForbiddenException('채널 소유자의 권한을 변경할 수 없습니다!');
    }

    requestedUserRelation.isAdmin = updateData.isAdmin;
    await this.channelRelationRepository.save(requestedUserRelation);

    return true;
  }

  async changeOwner(channelId: number, currentOwnerId: number, successorId: number): Promise<boolean> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

    if (currentOwnerId !== channel.user.id) {
      throw new ForbiddenException('채널의 소유자가 아닙니다!');
    }

    const successor = await this.channelRelationRepository.findOne({
      where: { channel, user: { id: successorId } },
    });

    if (!successor) {
      throw new NotFoundException('유저가 채널에 없습니다!');
    }

    channel.user = successor.user;
    await this.channelRepository.save(channel);

    successor.isOwner = true;
    await this.channelRelationRepository.save(successor);

    return true;
  }


  async inviteUser(
    channel: Channel,
    invitedUser: User,
  ): Promise<ChannelInvitation> {
    // 초대된 유저가 이미 초대된 건지 체크
    const existingInvitation = await this.channelInvitationRepository.findOne({
      where: { channel, user: invitedUser },
    });

    if (existingInvitation) {
      // 이미 초대됐다면 예외 발생
      throw new NotFoundException('유저가 채널에 이미 초대되었습니다!');
    }

    //초대된 채널 유저 데이터 저장
    const invitation = this.channelInvitationRepository.create({
      channel,
      user: invitedUser,
    });

    return this.channelInvitationRepository.save(invitation);
  }


  async join(user: User, channelId: number, providedPassword?: string): Promise<boolean> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });

    if (!channel) {
      throw new NotFoundException('채널을 찾을 수 없습니다!');
    }

    const existingRelation = await this.channelRelationRepository.findOne({
      where: { channel, user },
    });

    if (existingRelation) {
      throw new BadRequestException('이미 채널의 멤버입니다!');
    }

    // 유저가 채널에서 banned됐는지 체크
    const bannedUserRelation = await this.channelRelationRepository.findOne({
      where: { channel, user, isBanned: true },
    });

    if (bannedUserRelation) {
      throw new ForbiddenException('채널에서 banned된 유저입니다!');
    }

    if (channel.type === ChannelType.protected && !channel.password) {
      throw new BadRequestException('비밀번호를 입력하세요!');
    }

    if (channel.type === ChannelType.private) {
      throw new BadRequestException('비밀 채널입니다!');
    }

    if (channel.type === ChannelType.protected && channel.password) {
      const isPasswordValid = await bcrypt.compare(providedPassword, channel.password);

      if (!isPasswordValid) {
        throw new ForbiddenException('패스워드가 틀립니다!');
      }
    }

    const newRelation = this.channelRelationRepository.create({
      channel,
      user,
      isAdmin: false,
      isOwner: false,
    });

    await this.channelRelationRepository.save(newRelation);

    return true;
  }

}
