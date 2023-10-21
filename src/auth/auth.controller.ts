import { Controller, Get, Query, Res, Req, Post, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ){}

    @Get('sign-in')
    signIn(@Res() res: Response) {
        const state = this.authService.generateRandomString(16);
        res.redirect(this.authService.getRedirectUrl(state));
    }

    @Get('callback')
    async userRedirect(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @Query('state') state: string): Promise<void> {
        const userEmail = await this.authService.getEmail(state, code);
        const user = this.usersService.findByEmail(userEmail);
        if (user) {
            req.session.email = userEmail;
            res.send({ redirect: "home" });
        }
        else {
            res.send({ redirect: "register"});
        }
    }

    @Post('register')
    userAdd(@Req() req: Request, @Body() createUserDto: CreateUserDto){
        createUserDto.email = req.session.email;
        this.usersService.createUser(createUserDto);
    }
}


