import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService){ }

    @Get('/:id')
    userDetails(@Param('id') id: number) : Promise<User> {
        return this.usersService.findOne(id);
    }

    @Post('/register')
    userAdd(@Body() createUserDto: CreateUserDto ) : Promise<User> {
        // 추후에 로그인 구현할 때 createUser 인자에 email정보도 같이 전달해야될듯
        return this.usersService.createUser(createUserDto)
    }
}
