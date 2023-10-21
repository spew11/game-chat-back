import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';

@Injectable()
export class UsersService {

    constructor (
        @InjectRepository(User)
        private userRepository: Repository<User>
    ){}

    findAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    createUser(userDto: CreateUserDto) {
        return this.userRepository.save(userDto);
    }

    findById(id: number) {
        return this.userRepository.findOneBy({id});
    }
    
    async removeUser(id: number): Promise<void> {
        const user = await this.findById(id);
        this.userRepository.remove(user);
    }

    findByEmail(email: string) {
        const options: FindOneOptions<User> = { where: { email }};
        return this.userRepository.findOne(options);
    }

    async updateUser(id: number, userDto: UpdateUserDetailsDto): Promise<void> {
        const user = await this.findById(id);
        Object.assign(user, userDto);
        this.userRepository.save(user);
    }
}