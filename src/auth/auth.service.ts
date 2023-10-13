import { Injectable, Res } from '@nestjs/common';
import { Response } from 'express'
import { UsersService } from 'src/users/users.service';
import axios from 'axios';

@Injectable()
export class AuthService {
    private readonly BASE_URL1 = 'https://api.intra.42.fr/oauth/authorize';
    private readonly BASE_URL2 = 'https://api.intra.42.fr/oauth/token';
    private readonly CLIENT_ID = 'u-s4t2ud-de54b78c04a72d132d7cb6f482af06012215c021419df5316c2d42b852ca584e';
    private readonly REDIRECT_URI = encodeURIComponent('http://localhost:3000/auth/callback');
    private readonly RESPONSE_TYPE = 'code';
    private readonly CLIENT_SECRET = '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'; 
    // 클라이언트 시크릿 비밀이어야 되는데 이미 깃허브에 푸시해버림..
    // 나중에 다시 발급해서 숨김파일에 넣어놓고 푸시하지말자.
    
    constructor(private usersService: UsersService) {}
    
    getRedirectUrl(): string {
        const redirectUri = `${this.BASE_URL1}?client_id=${this.CLIENT_ID}&redirect_uri=${this.REDIRECT_URI}&response_type=${this.RESPONSE_TYPE}`;
        return redirectUri;
    }

    async getAccessToken(code: string): Promise<string> {
        const data = {
            grant_type: 'authorization_code',
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            redirect_uri: 'http://localhost:3000/auth/callback',
            code: code
        };
        try {
            const response = await axios.post(this.BASE_URL2, data);
            return response.data.access_token;
        } catch (error) {
            throw new Error('Error obtaining access token')
        }
    }

    async getEmail(code: string): Promise<string> {
        const accessToken = await this.getAccessToken(code);
        const response = await axios.get('https://api.intra.42.fr/v2/me', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        return response.data.email;
    }

    async handleUserRegistration(@Res() res: Response, email: string): Promise<void> {
        let user = await this.usersService.findByEmail(email);
        // if (!user) {
        //     user = await this.usersService.createUser(email);
        // }

        // if (user.nickname != null) {
        //     console.log(user.nickname);
        //     res.send({ redirect: "home" });
        // }
        // else {
        //     res.send({ redirect: "register"});
        // }
    }
}
