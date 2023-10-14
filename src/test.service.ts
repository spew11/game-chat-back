import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from "./users/users.service"
import { User } from './users/entities/user.entity';
import { UserRelationStatusEnum } from './enums/user-relation-status.enum';
import { UserRelation } from './user-relation/user-relation.entity';

@Injectable()
export class TestService {
    constructor(
        private readonly usersService: UsersService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserRelation)
        private readonly userRelationRepository: Repository<UserRelation>
    ) {}

    async addUser() : Promise<void> {
        const users = [
            { email: "user1@example.com", nickname: "user1" },
            { email: "user2@example.com", nickname: "user2" },
            { email: "user3@example.com", nickname: "user3" },
            { email: "user4@example.com", nickname: "user4" },
            { email: "user5@example.com", nickname: "user5" },
            { email: "user6@example.com", nickname: "user6" },
            { email: "user7@example.com", nickname: "user7" },
            { email: "user8@example.com", nickname: "user8" },
            { email: "user9@example.com", nickname: "user9" },
            { email: "user10@example.com", nickname: "user10" },
        ];

        for (const userData of users) {
            await this.userRepository.save(userData);
        }
    }

    async addUserRelation() : Promise<void> {
        const userRelations = [
            { userId: 1, otherUserId: 2, status: UserRelationStatusEnum.BLOCKED},
            { userId: 1, otherUserId: 3, status: UserRelationStatusEnum.BLOCKED},
            { userId: 1, otherUserId: 5, status: UserRelationStatusEnum.BLOCKED},
    
            { userId: 1, otherUserId: 4, status: UserRelationStatusEnum.FRIEND},
            { userId: 4, otherUserId: 1, status: UserRelationStatusEnum.FRIEND},
            { userId: 1, otherUserId: 7, status: UserRelationStatusEnum.FRIEND},
            { userId: 7, otherUserId: 1, status: UserRelationStatusEnum.FRIEND},
        ];

        for (const userRelationData of userRelations) {
            console.log(await this.userRelationRepository.save(userRelationData));
            
        }
    }
}

