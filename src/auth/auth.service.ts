import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { redisCli } from '@configs/session.config';

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

  getRedirectUrl(state: string, callbackUri: string): string {
    const authorizationUrl =
      `${this.AUTHORIZATION_URI}?` +
      `client_id=${this.configService.get<string>('CLIENT_ID')}&` +
      `redirect_uri=${callbackUri}&` +
      `response_type=code&scope=public&state=${state}`;
    return authorizationUrl;
  }

  async getAccessToken(state: string, code: string, callbackUri: string): Promise<string> {
    const data = {
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('CLIENT_ID'),
      client_secret: this.configService.get<string>('CLIENT_SECRET'),
      code: code,
      redirect_uri: callbackUri,
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
    const sessionData = await redisCli.hGet(`user:${user.id}`.toString(), 'email');
    if (sessionData) {
      throw new UnauthorizedException('이미 다른 기기에서 로그인되었습니다.');
    }
    req.session.email = user.email;
    await redisCli.hSet(`user:${user.id}`.toString(), { email: user.email });
  }

  async joinUser(createUserDto: CreateUserDto): Promise<User> {
    const existUser = await this.usersService.findByEmail(createUserDto.email);
    if (existUser) {
      throw new ConflictException('이미 가입된 유저입니다.');
    }
    return this.usersService.createUser(createUserDto);
  }
}
