import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { redisClient } from '@configs/session.config';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  private readonly AUTHORIZATION_URI = 'https://api.intra.42.fr/oauth/authorize';
  private readonly TOKEN_URL = 'https://api.intra.42.fr/oauth/token';
  private readonly USER_PROFILE_URL = 'https://api.intra.42.fr/v2/me';

  generateRandomString(length: number): string {
    return randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  getRedirectUrl(state: string): string {
    const authorizationUrl =
      `${this.AUTHORIZATION_URI}?` +
      `client_id=${this.configService.get<string>('CLIENT_ID')}&` +
      `redirect_uri=${this.configService.get<string>('CALLBACK_URI')}&` +
      `response_type=code&scope=public&state=${state}`;
    return authorizationUrl;
  }

  async getAccessToken(state: string, code: string): Promise<string> {
    const data = {
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('CLIENT_ID'),
      client_secret: this.configService.get<string>('CLIENT_SECRET'),
      code: code,
      redirect_uri: this.configService.get<string>('CALLBACK_URI'),
      state: state,
    };
    const response = await axios.post(this.TOKEN_URL, data);
    return response.data.access_token;
  }

  async getEmail(accessToken: string): Promise<string> {
    const response = await axios.get(this.USER_PROFILE_URL, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });
    return response.data.email;
  }

  async loginUser(req: Request, user: User): Promise<void> {
    const sessionId = await redisClient.hget(`user:${user.id}`, user.email);
    if (sessionId) {
      throw new UnauthorizedException('이미 다른 기기에서 로그인되었습니다.');
    }
    req.session.email = user.email;
    await redisClient.hset(`user:${user.id}`, user.email);
  }

  async joinUser(req: Request, createUserDto: CreateUserDto): Promise<void> {
    const user = await this.usersService.findByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('이미 가입된 유저입니다.');
    }
    this.usersService.createUser(createUserDto);
    this.loginUser(req, user);
  }
}
