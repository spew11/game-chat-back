import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import  { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor (
        @InjectRepository(User)
        private userRespository: Repository<User>,
    ){}

    findAll(): Promise<User[]> {
        return this.userRespository.find();
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { nickname } = createUserDto;
        const user = this.userRespository.create({
            // email,
            nickname,
        })
        await this.userRespository.save(user);
        return user;
    }

    async findOne(id: number): Promise <User | null> {
        const found = await this.userRespository.findOneBy({id});
        if (!found) {
            throw new NotFoundException(`Can't find User with id ${id}`)
        }
        return found;
    }
    
    async remove(id: number): Promise<void> {
        await this.userRespository.delete(id);
    }
}
