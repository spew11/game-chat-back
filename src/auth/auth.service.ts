import { Injectable, UsePipes } from '@nestjs/common';
import { pipe } from 'rxjs';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    // @UsePipes(pipe)
    // async singUp(): Promise<User> {
    //     return 
    // }
}
