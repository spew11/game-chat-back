import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.session && request.session.email) {
      const user: User = await this.usersService.findByEmail(request.session.email);
      if (!user) {
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }
      request.user = user;
      return true;
    }

    throw new UnauthorizedException('로그인이 필요합니다.');
  }
}
