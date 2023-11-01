import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserByIdPipe implements PipeTransform<number> {
  constructor(private readonly usersService: UsersService) {}

  async transform(id: number) {
    const user = await this.usersService.findById(id); 
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    return user;
  }
}
