import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRelation } from './user-relation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { UserRelationStatusEnum } from 'src/user-relation/enums/user-relation-status.enum';
import { CreateUserRelationDto } from './dtos/create-user-relation.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserRelationService {
  constructor(
    @InjectRepository(UserRelation)
    private userRelationRepository: Repository<UserRelation>,
    private usersService: UsersService,
  ) {}

  // user-otherUser 관계 객체 삭제
  async removeUserRelation(userId: number, otherUserId: number): Promise<void> {
    const userRelation = await this.userRelationRepository.findOne({
      where: {
        user: { id: userId },
        otherUser: { id: otherUserId },
      },
    });
    if (!userRelation) {
      throw new NotFoundException('존재하지 않는 유저 관계입니다.');
    }
    this.userRelationRepository.remove(userRelation);
  }

  // user-otherUser 관계 객체 생성
  createUserRelation(createUserRelationDto: CreateUserRelationDto): Promise<UserRelation> {
    return this.userRelationRepository.save(createUserRelationDto);
  }

  // user-otherUser 관계 객체 찾기
  findUserRelation(userId: number, otherUserId: number): Promise<UserRelation> {
    return this.userRelationRepository.findOne({
      where: {
        user: { id: userId },
        otherUser: { id: otherUserId },
      },
    });
  }

  // user-otherUser 친구 관계인지 체크
  async isFriendRelation(userId: number, otherUserId: number): Promise<boolean> {
    const userRelation = await this.findUserRelation(userId, otherUserId);
    if (userRelation && userRelation.status === UserRelationStatusEnum.FRIEND) {
      return true;
    }
    return false;
  }

  // user가 otherUser에게 차단당했는지 아닌지 확인
  async isBlockedRelation(userId: number, otherUserId: number): Promise<boolean> {
    const userRelation = await this.findUserRelation(otherUserId, userId);
    if (userRelation && userRelation.status === UserRelationStatusEnum.BLOCKED) {
      return true;
    }
    return false;
  }

  // user-otherUser(status=friend_request)객체 1개, otherUser-user(status=pending_approval) 객체 1개, 총 2개의 객체 생성
  async createFriendRequest(requester: User, recipient: User): Promise<void> {
    // 이미 친구 관계거나 상대가 나를 차단했다면 요청 불가
    if (
      (await this.isFriendRelation(requester.id, recipient.id)) ||
      (await this.isBlockedRelation(requester.id, recipient.id))
    ) {
      return;
    }
    // user-otherUser 인스턴스 생성
    const requesterDto = new CreateUserRelationDto();
    requesterDto.user = requester;
    requesterDto.otherUser = recipient;
    requesterDto.status = UserRelationStatusEnum.FRIEND_REQUEST;
    this.userRelationRepository.save(requesterDto);

    // otherUser-user 인스턴스 생성
    const recipientDto = new CreateUserRelationDto();
    recipientDto.user = recipient;
    recipientDto.otherUser = requester;
    recipientDto.status = UserRelationStatusEnum.PENDING_APPROVAL;
    this.userRelationRepository.save(recipientDto);
  }

  // user가 otherUser 차단
  async createBlockRelation(user: User, otherUser: User): Promise<void> {
    const userRelation = await this.findUserRelation(user.id, otherUser.id);

    if (userRelation) {
      // 이미 user-otherUser 객체가 존재한다면 status=block하고, otherUser-user 객체는 존재시 삭제
      userRelation.status = UserRelationStatusEnum.BLOCKED;
      this.userRelationRepository.save(userRelation);

      const otherRelation = await this.findUserRelation(otherUser.id, user.id);
      if (otherRelation) {
        this.userRelationRepository.remove(otherRelation);
      }
    } else {
      // user-otherUser 객체가 존재하지 않는다면 차단 관계 생성
      const createUserRelationDto: CreateUserRelationDto = new CreateUserRelationDto();
      createUserRelationDto.user = user;
      createUserRelationDto.otherUser = otherUser;
      createUserRelationDto.status = UserRelationStatusEnum.BLOCKED;
      this.createUserRelation(createUserRelationDto);
    }
  }

  // user와 otherUser가 친구가 됌
  async establishFriendship(userId: number, otherUserId: number): Promise<void> {
    const userRelation = await this.findUserRelation(userId, otherUserId);
    const otherRelation = await this.findUserRelation(otherUserId, userId);

    if (!userRelation || !otherRelation) {
      throw new NotFoundException('존재하지 않는 관계입니다.');
    }

    userRelation.status = UserRelationStatusEnum.FRIEND;
    this.userRelationRepository.save(userRelation);

    otherRelation.status = UserRelationStatusEnum.FRIEND;
    this.userRelationRepository.save(otherRelation);
  }

  // user기준으로 친구인 유저리스트 반환
  async findAllFriends(userId: number): Promise<User[]> {
    const relations = await this.userRelationRepository.find({
      where: {
        user: { id: userId },
        status: UserRelationStatusEnum.FRIEND,
      },
      relations: ['otherUser'],
    });
    return relations.map((relation) => relation.otherUser);
  }

  // user기준으로 차단 유저리스트 반환
  async findAllBlockedUsers(userId: number): Promise<User[]> {
    const relations = await this.userRelationRepository.find({
      where: {
        user: { id: userId },
        status: UserRelationStatusEnum.BLOCKED,
      },
      relations: ['otherUser'],
    });
    return relations.map((relation) => relation.otherUser);
  }
}
