import { Injectable, Inject, forwardRef, BadRequestException, InternalServerErrorException
, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In} from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/users/entities/user.entity';
import {Channel, ChannelType} from '../entities/channel.entity';
import { ChannelRelation } from '../entities/channel-relation.entity';
import { ChannelMutedUser } from '../entities/channel-mutedUser.entity';
import { ChannelBannedUser } from '../entities/channel-bannedUser.entity';

import { ChannelCreationDto } from '../dto/post-channel.dto';
import { CreateChannelRelationDto } from '../dto/post-channel-relation.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { DeleteChannelRelationDto } from '../dto/delete-channel-relation.dto';
import { CreateBannedUserDto } from '../dto/post-bannedUser.dto';
import { CreateMutedUserDto } from '../dto/post-mutedUser.dto';
import { DeleteBannedUserDto } from '../dto/delete-bannedUser.dto';
import { ChatService } from './channel-chat.service';
import { ChatGateway } from '../channel.gateway';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class ChannelService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelRelation)
    private channelRelationRepository: Repository<ChannelRelation>,

    @InjectRepository(ChannelBannedUser)
    private readonly channelBannedUserRepository: Repository<ChannelBannedUser>,
    @InjectRepository(ChannelMutedUser)
    private readonly channelMutedUserRepository: Repository<ChannelMutedUser>,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    @InjectEntityManager()
    private entityManager: EntityManager
  ) { }

  async create(channelCreationDto: ChannelCreationDto, owner_id: number) {
    const { title, password, type } = channelCreationDto;
    const tmp = await this.channelRepository.findOne({
      where: {
        title: title,
      },
    });

    if (tmp) throw new BadRequestException('이미 존재하는 채널 이름입니다!');

    let hashedPassword = null;

    if (password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const channel = await this.entityManager.transaction(async (manager) => {
      const channelRepository = manager.getRepository(Channel);
      const channelRelationRepository = manager.getRepository(ChannelRelation);

      const channel = channelRepository.create({
        owner_id,
        title,
        password: hashedPassword,
        type
      });
      await channelRepository.save(channel);

      const createChannelRelationDto: CreateChannelRelationDto = {
        channel_id: channel.id,
        user_id: owner_id,
        is_admin: true,
        password: password,
      };
      const channelRelation = channelRelationRepository.create(
        createChannelRelationDto,
      );
      await channelRelationRepository.save(channelRelation);

      return channel;
    });
    return channel;
  }

  async update(
    user_id: number,
    channel_id: number,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    const channel: Channel = await this.findOne(channel_id);

    this.checkIsChannelOwner(channel, user_id);

    if (updateChannelDto.title) {
      channel.title = updateChannelDto.title;
    }

    if (updateChannelDto.title) {
      const tmp = await this.channelRepository.findOne({
        where: {
          title: updateChannelDto.title,
        },
      });
      if (tmp && tmp.id !== channel_id)
        throw new BadRequestException('채널이 이미 존재합니다!');
    }
    if (updateChannelDto.type) {
      if (updateChannelDto.type === ChannelType.protected) {
        if (!updateChannelDto.password)
          throw new InternalServerErrorException(
            'proteced 채널을 생성하려면 비밀번호를 입력해주세요!',
          );
        const salt = await bcrypt.genSalt();
        channel.password = await bcrypt.hash(updateChannelDto.password, salt);
      }
      channel.type = updateChannelDto.type;
    }
    await this.channelRepository.save(channel);

    return channel;
  }

  async findAll(): Promise<Channel[]> {
    try {
      const channels = await this.channelRepository.find({
        where: {
          type: In([ChannelType.public, ChannelType.protected]),
        },
      });
      return channels;
    } catch (err) {
      console.log(err);
    }
  }

  async findOne(channel_id: number | string, relations?: string[]) {
    if (typeof channel_id === 'string') channel_id = parseInt(channel_id);
    if (!relations)
      relations = [
        'channelRelations',
        'channelMutedUsers',
        'channelBannedUsers',
      ];

    const channel = await this.channelRepository.findOne({
      where: {
        id: channel_id,
      },
      relations: relations,
    });
    if (!channel) throw new NotFoundException('존재하지 않는 채널입니다!');

    return channel;
  }

  async findOneChannelMember(channel_id: number | string, user_id: number) {
    if (typeof channel_id === 'string') channel_id = parseInt(channel_id);

    const channelMember = await this.channelRelationRepository.findOne({
      where: {
        channel_id,
        user_id,
      },
      relations: ['user'],
    });
    if (!channelMember)
      throw new NotFoundException('존재하지 않는 채널 멤버입니다!');

    return channelMember;
  }

  async findAllChannelMember(
    channel_id: number,
  ): Promise<ChannelRelation[]> {
    const channelRelations = await this.channelRelationRepository.find({
      where: {
        channel_id: channel_id,
      },
      relations: ['user'],
    });
    console.log(channelRelations);
    return channelRelations;
  }

  async findAllChannelMutedMember(
    channel_id: number,
  ): Promise<ChannelMutedUser[]> {
    const channelMutedMembers = await this.channelMutedUserRepository.find({
      where: {
        channel_id: channel_id,
      },
    });
    console.log(channelMutedMembers);
    return channelMutedMembers;
  }

  async findAllChannelBannedMember(
    channel_id: number,
  ): Promise<ChannelBannedUser[]> {
    const channelBannedUsers = await this.channelBannedUserRepository.find({
      where: {
        channel_id: channel_id,
      },
      relations: ['user'],
    });
    console.log(channelBannedUsers);
    return channelBannedUsers;
  }

  async checkChannelAdmin(user_id: number, channel_id: number): Promise<boolean> {
    const channelMember = await this.channelRelationRepository.findOne({
      where: {
        user_id: user_id,
        channel_id: channel_id,
      },
    });
    if (!channelMember)
      throw new NotFoundException('존재하지 않는 채널 멤버입니다!');
    if (!channelMember.is_admin)
      throw new BadRequestException('채널 관리자가 아닙니다!');

    return true;
  }

  async updateChannelAdmin(
    user_id: number,
    channel_id: number,
    member_id: number,
  ) {
    const channel = await this.channelRepository.findOne({
      where: {
        id: channel_id,
      },
      relations: {
        user: true,
        channelRelations: true,
      },
    }); //

    if (!channel) throw new NotFoundException('존재하지 않는 채널입니다!');
    if (channel.owner_id !== user_id)
      throw new BadRequestException('채널 owner가 아닙니다!');

    if (member_id === user_id)
      throw new BadRequestException('채널 owner입니다!');

    const member = channel.channelRelations.find(
      (member) => member.user_id === member_id,
    );
    if (!member) throw new NotFoundException('존재하지 않는 채널 멤버입니다!');

    member.is_admin = !member.is_admin;
    await this.channelRelationRepository.save(member);
    return member;
  }

  checkIsChannelMember(channel: Channel, user_id: number): ChannelRelation {
    const member = channel.channelRelations.find(
      (member) => member.user_id === user_id,
    );
    if (!member) throw new NotFoundException('채널 멤버가 아닙니다!');
    return member;
  }

  checkIsChannelAdmin(channel: Channel, user_id: number): ChannelRelation {
    const admin = channel.channelRelations.find(
      (member) => member.user_id === user_id,
    );
    if (!admin) throw new NotFoundException('채널 멤버가 아닙니다!');
    if (!admin.is_admin)
      throw new BadRequestException('채널 관리자가 아닙니다!');
    return admin;
  }

  checkIsChannelOwner(channel: Channel, user_id: number) {
    if (channel.owner_id !== user_id)
      throw new BadRequestException('채널 Owner가 아닙니다!');
  }

  checkIsNotChannelOwner(channel: Channel, user_id: number) {
    if (channel.owner_id === user_id)
      throw new BadRequestException(
        '채널 owner에게는 해당 작업을 수행할 수 없습니다!',
      );
  }

  checkIsMe(user_id: number, member_id: number) {
    if (user_id === member_id)
      throw new BadRequestException(
        '본인에게는 해당 작업을 수행할 수 없습니다!',
      );
  }





  ////////////////////////////////////////////////////////////////////////
  // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ채널 출입, 초대ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
  ///////////////////////////////////////////////////////////////////////

  async join(createChannelRelationDto: CreateChannelRelationDto) {
    const channel = await this.findOne(
      createChannelRelationDto.channel_id,
      ['channelRelations', 'channelBannedUsers'],
    );

    if (
      channel.channelRelations.find(
        (member) => member.user_id === createChannelRelationDto.user_id,
      )
    ) {
      return channel;
    }

    if (channel.type === ChannelType.protected) {
      const is_match = await bcrypt.compare(
        createChannelRelationDto.password,
        channel.password,
      );
      if (!is_match) throw new BadRequestException('비밀번호가 틀렸습니다!');
    }
    else if (channel.type === ChannelType.private) {
      throw new BadRequestException('비밀 채널입니다!');
    }

    const bannedMember = channel.channelBannedUsers.find(
      (member) => member.user_id === createChannelRelationDto.user_id,
    );
    if (bannedMember) throw new BadRequestException('banned된 유저입니다!');

    const channelMember = this.channelRelationRepository.create(
      createChannelRelationDto,
    );
    await this.channelRelationRepository.save(channelMember);

    return channel;
  }

  async exit(deleteChannelRelationDto: DeleteChannelRelationDto) {
    return await this.channelRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        await transactionalEntityManager.delete(ChannelRelation, {
          channel_id: deleteChannelRelationDto.channel_id,
          user_id: deleteChannelRelationDto.user_id,
        });

        const channelRelations = await transactionalEntityManager.find(
          ChannelRelation,
          {
            where: { channel_id: deleteChannelRelationDto.channel_id },
            order: { updatedAt: 'ASC' },
          },
        );

        let channel = await transactionalEntityManager.findOne(Channel, {
          where: { id: deleteChannelRelationDto.channel_id },
        });

        if (!channel) throw new Error('채널이 존재하지 않습니다!');

        if (channelRelations.length === 0) {
          await transactionalEntityManager.delete(Channel, {
            id: deleteChannelRelationDto.channel_id,
          });
          return channel;
        }

        if (channel.owner_id === deleteChannelRelationDto.user_id) {
          const oldAdmin = channelRelations.find((member) => member.is_admin);
          const newowner_id = oldAdmin ? oldAdmin.user_id : channelRelations[0].user_id;

          await transactionalEntityManager.update(Channel, channel.id, {
            owner_id: newowner_id,
          });
        }
        return await transactionalEntityManager.findOne(Channel, {
          where: { id: deleteChannelRelationDto.channel_id },
        });
      },
    );
  }

  async invite(user_id: number, createChannelRelationDto: CreateChannelRelationDto) {
    const member: User = await this.usersService.findById(createChannelRelationDto.user_id);
    if (!member) throw new NotFoundException('존재하지 않는 유저입니다!');

    const channel: Channel = await this.findOne(
      createChannelRelationDto.channel_id,
      ['channelRelations'],
    );

    if (
      channel.channelRelations.find(
        (member: ChannelRelation) =>
          member.user_id === createChannelRelationDto.user_id,
      )
    ) {
      throw new ConflictException('이미 채널에 참여한 유저입니다!');
    }

    this.checkIsChannelOwner(channel, user_id);

    const channelMember: ChannelRelation =
      this.channelRelationRepository.create(createChannelRelationDto);
    await this.channelRelationRepository.save(channelMember);

    return channelMember;
  }




  //////////////////////////////////////////////////////////////////////
  // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 소켓 처리 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
  //////////////////////////////////////////////////////////////////////

  async ban(
    createBannedUserDto: CreateBannedUserDto,
    user_id: number,
  ) {
    const channel = await this.findOne(
      createBannedUserDto.channel_id,
      ['channelRelations', 'channelBannedUsers'],
    );

    this.checkIsChannelAdmin(channel, user_id);

    this.checkIsChannelMember(
      channel,
      createBannedUserDto.user_id,
    );

    this.checkIsNotChannelOwner(
      channel,
      createBannedUserDto.user_id,
    );

    this.checkIsMe(user_id, createBannedUserDto.user_id);

    let banMember = channel.channelBannedUsers.find(
      (member) => member.user_id === createBannedUserDto.user_id);
    if (banMember) return banMember;
    banMember = this.channelBannedUserRepository.create(
      createBannedUserDto,
    );
    await this.channelBannedUserRepository.save(banMember);

    this.chatGateway.kickMember(
      createBannedUserDto.channel_id,
      createBannedUserDto.user_id,
    );

    await this.channelRelationRepository.delete(createBannedUserDto);
    return banMember;
  }

  async deleteChannelBannedMember(
    user_id: number,
    deleteBannedUserDto: DeleteBannedUserDto,
  ): Promise<ChannelBannedUser> {
    const channel = await this.findOne(
      deleteBannedUserDto.channel_id,
      ['channelRelations', 'channelBannedUsers'],
    );

    this.checkIsChannelAdmin(channel, user_id);

    const channelBannedMember =
      await this.channelBannedUserRepository.findOne({
        where: {
          channel_id: deleteBannedUserDto.channel_id,
          user_id: deleteBannedUserDto.user_id,
        },
      });
    if (!channelBannedMember)
      throw new NotFoundException('존재하지 않는 채널 차단 멤버입니다!');

    await this.channelBannedUserRepository.delete(
      deleteBannedUserDto,
    );
    return channelBannedMember;
  }

  async kick(user_id: number, channel_id: number, member_id: number) {
    const channel = await this.findOne(channel_id, [
      'channelRelations',
    ]);

    this.checkIsChannelAdmin(channel, user_id);

    const channelMember = this.checkIsChannelMember(
      channel,
      member_id,
    );

    this.checkIsNotChannelOwner(channel, member_id);

    this.checkIsMe(user_id, member_id);

    this.chatGateway.kickMember(channel_id, member_id);

    await this.channelRelationRepository.delete({ user_id: member_id });

    return channelMember;
  }

  async mute(
    createMutedUserDto: CreateMutedUserDto,
    user_id: number,
  ) {
    const channel = await this.findOne(
      createMutedUserDto.channel_id,
      ['channelRelations', 'channelMutedUsers'],
    );

    this.checkIsChannelAdmin(channel, user_id);

    this.checkIsChannelMember(channel, createMutedUserDto.user_id);

    this.checkIsNotChannelOwner(channel, createMutedUserDto.user_id);

    this.checkIsMe(user_id, createMutedUserDto.user_id);

    let mutedMember = channel.channelMutedUsers.find(
      (member) => member.user_id === createMutedUserDto.user_id,
    );

    if (mutedMember) return mutedMember;

    mutedMember = this.channelMutedUserRepository.create(createMutedUserDto);
    await this.channelMutedUserRepository.save(mutedMember);

    this.chatService.addMutedMember(
      channel.id,
      mutedMember.user_id,
      mutedMember.mutedTime,
      mutedMember.createdAt,
    );

    return mutedMember;
  }

  async unmute(channel_id: number, user_id: number) {
    const channel = await this.findOne(channel_id, [
      'channelRelations',
      'channelMutedUsers',
    ]);

    const mutedMember = channel.channelMutedUsers.find(
      (member) => member.user_id === user_id,
    );

    console.log('mutedMember!', mutedMember);
    if (!mutedMember) return; // mute하려는 멤버가 muted된 멤버가 아니면

    await this.channelMutedUserRepository.delete({
      channel_id: channel_id,
      user_id: user_id,
    });

    return mutedMember;
  }

}
