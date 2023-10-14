import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDetailsDto } from './dtos/update-user-details.dto';

@Injectable()
export class UsersService {

    constructor (
        @InjectRepository(User)
        private userRepository: Repository<User>
    ){}

    findAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        return await this.userRepository.save(userDto);
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOneBy({id});
    }
    
    async removeUser(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

    async findByEmail(email: string): Promise <User | null> {
        const options: FindOneOptions<User> = { where: { email }};
        return await this.userRepository.findOne(options);
    }

    async updateUser(id: number, userDto: UpdateUserDetailsDto): Promise<void> {
        const user = await this.findById(id);
        Object.assign(user, userDto);
        await this.userRepository.save(user);
    }

    async updateUserWin(id: number): Promise<void> {
        const user = await this.findById(id);
        user.total_wins += 1;
        await this.userRepository.save(user);
    }

    async updateUserlose(id: number): Promise<void> {
        const user = await this.findById(id);
        user.total_losses += 1;
        await this.userRepository.save(user);
    }
}