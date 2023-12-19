import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { SecureShieldService } from 'src/secure-shield/secure-shield.service';
import { TotpDto } from 'src/secure-shield/dtos/totp.dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private secureShieldService: SecureShieldService,
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

  async saveSession(req: Request, user: User): Promise<void> {
    if (user) {
      req.session.userId = user.id;
      if (req?.session.userId) {
        console.log(`***express session 저장 성공!: ${req.session.userId} ***`);
      }
    } else {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
  }

  async removeSession(req: Request) {
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(console.log(`LOGOUT ERR: ${err}`));
        }
        resolve(undefined);
      });
    });
  }

  async joinUser(userEmail: string, createUserDto: CreateUserDto): Promise<User> {
    if (await this.usersService.findByEmail(userEmail)) {
      throw new BadRequestException('이미 가입된 유저입니다.');
    }
    if (await this.usersService.findByNickname(createUserDto.nickname)) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }
    return this.usersService.createUser(userEmail, createUserDto);
  }

  async initialize2fa(res: Response, user: User): Promise<string> {
    if (user.is2fa) {
      throw new BadRequestException('2단계 인증이 이미 활성화 상태입니다.');
    }
    if (!user.otpSecret) {
      await this.usersService.createSecretKey(user);
    }
    return this.secureShieldService.generateTotpQrCode(
      user.email,
      this.secureShieldService.decrypt(user.otpSecret),
    );
  }

  async verifyTotpAndEnable2fa(user: User, totpDto: TotpDto): Promise<boolean> {
    if (user.otpSecret) {
      const otpSecret = this.secureShieldService.decrypt(user.otpSecret);
      if (this.secureShieldService.isValidTotp(totpDto.token, otpSecret)) {
        await this.usersService.activate2fa(user);
        return true;
      } else {
        return false;
      }
    } else {
      throw new NotFoundException('2단계 인증 정보가 존재하지 않습니다.');
    }
  }

  async loginWithTotpValidation(req: Request, userEmail: string, totpDto: TotpDto) {
    const user = await this.usersService.findByEmail(userEmail);
    if (user) {
      if (user.is2fa && user.otpSecret) {
        const otpSecret = this.secureShieldService.decrypt(user.otpSecret);
        if (this.secureShieldService.isValidTotp(totpDto.token, otpSecret)) {
          await this.saveSession(req, user);
          return true;
        } else {
          return false;
        }
      } else {
        throw new BadRequestException('2단계 인증이 비활성화 상태입니다.');
      }
    } else {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
  }
}
