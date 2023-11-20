import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SecureShieldService } from 'src/secure-shield/secure-shield.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private secureShieldService: SecureShieldService,
  ) {}

  findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  createUser(userEmail: string, createUserDto: CreateUserDto): Promise<User> {
    const secretKey = this.secureShieldService.generateSecretKey();
    const encrypted = this.secureShieldService.encrypt(secretKey);
    return this.userRepository.save({
      email: userEmail,
      otpSecret: encrypted,
      ...createUserDto,
    });
  }

  findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User> {
    const options: FindOneOptions<User> = { where: { email } };
    return this.userRepository.findOne(options);
  }

  updateUser(user: User, updateUserDto: UpdateUserDto) {
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
}
