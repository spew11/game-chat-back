import { Controller, Post, Res } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Controller()
export class AuthController {
    // @Post('sign-in')
    // async signIn(@Res res: Response) {
    //     // 세션에서 토큰 가져와서 로그인 처리한 후 캐릭터 등록 여부에 따라 분기
    //     if (usersService.findByEmail(email).getNickname()) {
    //         return res.redirect('/home');
    //     }
    //     else {
    //         return res.redirect('/users/resister');
    //     }
    // }
}
