import { Injectable, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express'
import { UsersService } from 'src/users/users.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService, 
        private configService: ConfigService,
        ) {}

    private readonly AUTHORIZATION_URI = 'https://api.intra.42.fr/oauth/authorize';
    private readonly TOKEN_URL = 'https://api.intra.42.fr/oauth/token';
    private readonly USER_PROFILE_URL = 'https://api.intra.42.fr/v2/me';
    private readonly CALLBACK_URI = `http://localhost:${this.configService.get<string>('SERVER_PORT')}/auth/callback`;

    generateRandomString(length: number): string {
        return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }

    getRedirectUrl(state: string): string {
        const authorizationUrl = `${this.AUTHORIZATION_URI}?` +
        `client_id=${this.configService.get<string>('CLIENT_ID')}&` +
        `redirect_uri=${this.CALLBACK_URI}&` +
        `response_type=code&scope=public&state=${state}`;
        return authorizationUrl;
    }
    
    async getAccessToken(state: string, code: string) : Promise<string>{
        const data = {
            grant_type: 'authorization_code',
            client_id: this.configService.get<string>('CLIENT_ID'),
            client_secret: this.configService.get<string>('CLIENT_SECRET'),
            code: code,
            redirect_uri: this.CALLBACK_URI,
            state: state
        };
        const response = await axios.post(this.TOKEN_URL, data);
        return response.data.access_token;
    }

    async getEmail(state: string, code: string): Promise<string> {
        const accessToken = await this.getAccessToken(state, code);
        const response = await axios.get(this.USER_PROFILE_URL, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        return response.data.email;
    }
}
