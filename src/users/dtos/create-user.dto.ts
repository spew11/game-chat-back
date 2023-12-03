import { IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^[\da-zA-Z가-힣]{1,8}$/, {
    message: '닉네임은 8자리 이하의 한글, 영문자, 숫자로만 가능합니다.',
  })
  nickname: string;
}
