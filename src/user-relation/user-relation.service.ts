import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRelation } from './user-relation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRelationStatusEnum } from 'src/user-relation/enums/user-relation-status.enum';
import { CreateUserRelationDto } from './dtos/create-user-relation.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class UserRelationService {
  constructor(
    @InjectRepository(UserRelation)
    private userRelationRepository: Repository<UserRelation>,
  ) {}

  // transaction으로 묶어야됌
  async deleteFriendship(userId: number, otherUserId: number): Promise<void> {
    const userSide = await this.findUserRelation(userId, otherUserId);
    const theOtherSide = await this.findUserRelation(otherUserId, userId);
    if (userSide?.status === UserRelationStatusEnum.FRIEND && theOtherSide?.status === UserRelationStatusEnum.FRIEND) {
      this.userRelationRepository.remove([userSide, theOtherSide]);
    } else {
      throw new NotFoundException('잘못된 요청입니다.');
    }
  }

  async rejectFriendship(userId: number, otherUserId: number): Promise<void> {
    const userSide = await this.findUserRelation(userId, otherUserId);
    const theOtherSide = await this.findUserRelation(otherUserId, userId);
    if (
      userSide?.status === UserRelationStatusEnum.PENDING_APPROVAL &&
      theOtherSide?.status === UserRelationStatusEnum.FRIEND_REQUEST
    ) {
      this.userRelationRepository.remove([userSide, theOtherSide]);
    }
  }

  // user-otherUser 관계 객체 삭제
  async removeUserRelation(userId: number, otherUserId: number): Promise<void> {
    const relation = await this.userRelationRepository.findOne({
      where: {
        user: { id: userId },
        otherUser: { id: otherUserId },
      },
    });
    if (!relation) {
      throw new NotFoundException('존재하지 않는 유저 관계입니다.');
    }
    this.userRelationRepository.remove(relation);
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
    const userSide = await this.findUserRelation(userId, otherUserId);
    const theOtherSide = await this.findUserRelation(otherUserId, userId);
    if (userSide?.status === UserRelationStatusEnum.FRIEND && theOtherSide?.status === UserRelationStatusEnum.FRIEND) {
      return true;
    }
    return false;
  }

  // user가 otherUser에게 차단당했는지 아닌지 확인
  async isBlockedRelation(userId: number, otherUserId: number): Promise<boolean> {
    const otherUserSide = await this.findUserRelation(otherUserId, userId);
    if (otherUserSide?.status === UserRelationStatusEnum.BLOCKED) {
      return true;
    }
    return false;
  }

  // user-otherUser(status=friend_request)객체 1개, otherUser-user(status=pending_approval) 객체 1개, 총 2개의 객체 생성
  async createFriendRequest(requester: User, recipient: User): Promise<void> {
    // 내가 상대방과 아무 사이아닐 때 가능함. 상대방이 나를 차단했어도 요청은 할 수 있음(상대입장은 여전히 차단함)
    const requesterSide = this.findUserRelation(requester.id, recipient.id);
    const recipientSide = this.findUserRelation(recipient.id, requester.id);
    if (!requesterSide) {
      // user-otherUser 인스턴스 생성
      const requesterDto = new CreateUserRelationDto();
      requesterDto.user = requester;
      requesterDto.otherUser = recipient;
      requesterDto.status = UserRelationStatusEnum.FRIEND_REQUEST;
      this.userRelationRepository.save(requesterDto);
      if (!recipientSide) {
        // otherUser-user 인스턴스 생성
        const recipientDto = new CreateUserRelationDto();
        recipientDto.user = recipient;
        recipientDto.otherUser = requester;
        recipientDto.status = UserRelationStatusEnum.PENDING_APPROVAL;
        this.userRelationRepository.save(recipientDto);
      }
    } else {
      throw new NotFoundException('잘못된 요청입니다.');
    }
  }

  // user가 otherUser 차단
  async createBlockRelation(user: User, otherUser: User): Promise<void> {
    const userSide = await this.findUserRelation(user.id, otherUser.id);

    // 이미 userSide 관계가 존재한다면 status=block으로 변경
    if (userSide?.status != UserRelationStatusEnum.BLOCKED) {
      userSide.status = UserRelationStatusEnum.BLOCKED;
      this.userRelationRepository.save(userSide);
    } else {
      // userSide 관계가 존재하지 않는다면 차단 관계 생성
      const createUserRelationDto: CreateUserRelationDto = new CreateUserRelationDto();
      createUserRelationDto.user = user;
      createUserRelationDto.otherUser = otherUser;
      createUserRelationDto.status = UserRelationStatusEnum.BLOCKED;
      this.createUserRelation(createUserRelationDto);
    }

    // 상대방 입장에서의 관계가 존재하는데, 상대방이 친구요청이나 차단을 한경우가 아니면 삭제함
    const theOtherSide = await this.findUserRelation(otherUser.id, user.id);
    if (
      theOtherSide?.status === UserRelationStatusEnum.FRIEND ||
      theOtherSide?.status === UserRelationStatusEnum.PENDING_APPROVAL
    ) {
      this.userRelationRepository.remove(theOtherSide);
    }
  }

  // user와 otherUser가 친구가 됌
  async establishFriendship(userId: number, otherUserId: number): Promise<void> {
    const userSide = await this.findUserRelation(userId, otherUserId);
    const theOtherSide = await this.findUserRelation(otherUserId, userId);
    if (
      userSide?.status === UserRelationStatusEnum.PENDING_APPROVAL &&
      theOtherSide?.status === UserRelationStatusEnum.FRIEND_REQUEST
    ) {
      userSide.status = UserRelationStatusEnum.FRIEND;
      theOtherSide.status = UserRelationStatusEnum.FRIEND;
      this.userRelationRepository.save([userSide, theOtherSide]);
    } else {
      throw new NotFoundException('잘못된 요청입니다.');
    }
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

  async unblockUserRelation(userId: number, otherUserId: number): Promise<void> {
    const userSide = await this.findUserRelation(userId, otherUserId);
    if (userSide?.status === UserRelationStatusEnum.BLOCKED) {
      const theOtherSide = await this.findUserRelation(otherUserId, userId);
      if (theOtherSide?.status == UserRelationStatusEnum.FRIEND_REQUEST) {
        // 상대방이 나에게 친구요청을 했었다면, 친구수락펜딩으로 수정
        userSide.status = UserRelationStatusEnum.PENDING_APPROVAL;
      } else {
        this.userRelationRepository.remove(userSide);
      }
    } else {
      throw new NotFoundException('잘못된 요청입니다.');
    }
  }
}
