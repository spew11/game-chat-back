import {
  Controller,
  Get,
  Query,
  Res,
  Req,
  Post,
  Body,
  Param,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { GetUser } from './user.decorator';
import { User } from 'src/users/user.entity';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response, @GetUser() user: User): Promise<void> {
    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException();
      }
      res.clearCookie('access_token');
    });
    // const sessionKey = `user:${user.id}`;
    // if (await redisCli.exists(sessionKey)) {
    //   await redisCli.hDel(sessionKey, ['email']);
    //   res.send('로그아웃 성공');
    // } else {
    //   res.send('로그아웃 실패');
    // }
  }

  @Get('sign-in')
  signIn(@Res() res: Response, @Query('callback_uri') callbackUri: string) {
    const state = this.authService.generateRandomString(16);
    res.status(200).send({ data: this.authService.getRedirectUrl(state, callbackUri) });
  }

  @Get('user-redirect')
  async userRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('callback_uri') callbackUri: string,
  ): Promise<void> {
    const accessToken = await this.authService.getAccessToken(state, code, callbackUri);
    const userEmail = await this.authService.getEmail(accessToken);
    const user = await this.usersService.findByEmail(userEmail);
    if (user) {
      this.authService.loginUser(req, user);
      res.send({ redirect: 'home' });
    } else {
      res.header('Set-Cookie', [`access_token=${accessToken}; SameSite=None; Secure; Max-Age=720000; HttpOnly=false`]);
      res.send({ redirect: 'register' });
    }
  }

  @Post('register')
  async userAdd(@Req() req: Request, @Res() res: Response, @Body() createUserDto: CreateUserDto): Promise<void> {
    const accessToken = req.cookies['access_token'];
    if (accessToken) {
      const userEmail = await this.authService.getEmail(accessToken);
      createUserDto.email = userEmail;
      const newUser = await this.authService.joinUser(createUserDto);
      this.authService.loginUser(req, newUser);
      res.send({ redirect: 'home' });
    } else {
      throw new UnauthorizedException('42로그인이 필요합니다.');
    }
    res.send('가입성공');
  }

  @Get('login/:email')
  async loginTest(@Req() req: Request, @Res() res: Response, @Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    console.log(email);
    this.authService.loginUser(req, user);
    res.send(`${email} 로그인 성공`);
  }
}
