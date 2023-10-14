import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException, Res } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDetailsDto } from './dtos/update-user-details.dto';

@Injectable()
export class UsersService {

    constructor (
        @InjectRepository(User)
        private userRespository: Repository<User>,
    ){}

    findAllUsers(): Promise<User[]> {
        return this.userRespository.find();
    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        const user = this.userRespository.create(userDto);
        await this.userRespository.save(user);
        return user;
    }

    async findById(id: number): Promise<User | null> {
        const found = await this.userRespository.findOneBy({id});
        console.log("FOUND: ", found)
        return found;
    }
    
    async removeUser(id: number): Promise<void> {
        await this.userRespository.delete(id);
    }

    async findByEmail(email: string): Promise <User | null> {
        const options: FindOneOptions<User> = { where: { email }};
        const found = await this.userRespository.findOne(options);
        return found;
    }

    async updateUser(id: number, userDto: UpdateUserDetailsDto): Promise<void> {
        const user = await this.findById(id);
        if (user == null) {
            throw new NotFoundException(`User with ID ${id} not found`); // 안해줘도 될듯
        }
        Object.assign(user, userDto);
        user.nickname = userDto.nickname;
        await this.userRespository.save(user);
    }
    
    // 아래는 테스트용 코드입니다. 웹서버 실행시 실행됌
    async testAddUser() : Promise<void> {
        const users = [
            { email: "dhbdg11@gmail.com", nickname: "spew11" },
            { email: "user2@example.com", nickname: "user2" },
            { email: "user3@example.com", nickname: "user3" },
            { email: "user4@example.com", nickname: "user4" },
            { email: "user5@example.com", nickname: "user5" },
            { email: "user6@example.com", nickname: "user6" },
            { email: "user7@example.com", nickname: "user7" },
            { email: "user8@example.com", nickname: "user8" },
            { email: "user9@example.com", nickname: "user9" },
            { email: "user10@example.com", nickname: "user10" }
        ];

        for (const user of users) {
            await this.createUser(user);
        }
    }
}