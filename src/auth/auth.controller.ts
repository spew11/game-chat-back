import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ){}

    @Get('sign-in')
    signIn(@Res() res: Response) {
        res.redirect(this.authService.getRedirectUrl());
    }

    @Get('/callback')
    async userRedirect(@Res() res: Response, @Query('code') code: string): Promise<void> {
        const email = await this.authService.getEmail(code);
        this.authService.handleUserRegistration(res, email);
        
        // const sessionId = 'hash';
        // res.cookie('sessionId', sessionId, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'strict',
        //     maxAge: 7200000
        // });
    }
}


