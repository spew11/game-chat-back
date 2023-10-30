import { Controller, Get, Query, Res, Req, Post, Body, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get('sign-in')
  signIn(@Res() res: Response) {
    const state = this.authService.generateRandomString(16);
    res.status(200).send({ data: this.authService.getRedirectUrl(state) });
  }

  @Get('user-redirect')
  async userRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<void> {
    const accessToken = await this.authService.getAccessToken(state, code);
    const userEmail = await this.authService.getEmail(accessToken);
    const user = await this.usersService.findByEmail(userEmail);
    if (user) {
      this.authService.loginUser(userEmail, req.session);
      res.send({ redirect: 'home' });
    } else {
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        // sameSite: 'strict',
        maxAge: 720000,
      });
      res.send({ redirect: 'register' });
    }
  }

  @Post('register')
  async userAdd(@Req() req: Request, @Body() createUserDto: CreateUserDto): Promise<void> {
    const accessToken = req.cookies['access_token'];
    if (accessToken) {
      createUserDto.email = await this.authService.getEmail(accessToken);
      this.usersService.createUser(createUserDto);
    } else {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
  }
}
