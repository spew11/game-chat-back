import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users/users.service';
import { User } from './users/user.entity';
import { UserRelationStatusEnum } from './user-relation/enums/user-relation-status.enum';
import { UserRelation } from './user-relation/user-relation.entity';
import { CreateUserRelationDto } from './user-relation/dtos/create-user-relation.dto';

@Injectable()
export class TestService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRelation)
    private readonly userRelationRepository: Repository<UserRelation>,
  ) {}

  async addUser(): Promise<void> {
    const users = [
      { email: 'user1@example.com', nickname: 'user1' },
      { email: 'user2@example.com', nickname: 'user2' },
      { email: 'user3@example.com', nickname: 'user3' },
      { email: 'user4@example.com', nickname: 'user4' },
      { email: 'user5@example.com', nickname: 'user5' },
      { email: 'user6@example.com', nickname: 'user6' },
      { email: 'user7@example.com', nickname: 'user7' },
      { email: 'user8@example.com', nickname: 'user8' },
      { email: 'user9@example.com', nickname: 'user9' },
      { email: 'user10@example.com', nickname: 'user10' },
    ];

    for (const userData of users) {
      if (!(await this.userRepository.findBy({ email: userData.email })))
        await this.userRepository.save(userData);
    }
  }

  async addUserRelation(): Promise<void> {
    const userRelations: CreateUserRelationDto[] = [];

    userRelations.push({
      user: await this.usersService.findById(1),
      otherUser: await this.usersService.findById(2),
      status: UserRelationStatusEnum.FRIEND,
    });
    userRelations.push({
      user: await this.usersService.findById(2),
      otherUser: await this.usersService.findById(1),
      status: UserRelationStatusEnum.FRIEND,
    });
    userRelations.push({
      user: await this.usersService.findById(1),
      otherUser: await this.usersService.findById(3),
      status: UserRelationStatusEnum.FRIEND,
    });
    userRelations.push({
      user: await this.usersService.findById(3),
      otherUser: await this.usersService.findById(1),
      status: UserRelationStatusEnum.FRIEND,
    });
    userRelations.push({
      user: await this.usersService.findById(1),
      otherUser: await this.usersService.findById(4),
      status: UserRelationStatusEnum.FRIEND,
    });
    userRelations.push({
      user: await this.usersService.findById(4),
      otherUser: await this.usersService.findById(1),
      status: UserRelationStatusEnum.FRIEND,
    });
    userRelations.push({
      user: await this.usersService.findById(1),
      otherUser: await this.usersService.findById(5),
      status: UserRelationStatusEnum.BLOCKED,
    });
    userRelations.push({
      user: await this.usersService.findById(1),
      otherUser: await this.usersService.findById(6),
      status: UserRelationStatusEnum.BLOCKED,
    });
    userRelations.push({
      user: await this.usersService.findById(1),
      otherUser: await this.usersService.findById(7),
      status: UserRelationStatusEnum.FRIEND_REQUEST,
    });
    userRelations.push({
      user: await this.usersService.findById(7),
      otherUser: await this.usersService.findById(1),
      status: UserRelationStatusEnum.PENDING_APPROVAL,
    });
    for (const userRelation of userRelations) {
      if (
        !(await this.userRelationRepository.findBy({
          user: userRelation.user,
          otherUser: userRelation.otherUser,
        }))
      )
        await this.userRelationRepository.save(userRelation);
    }
  }
}
