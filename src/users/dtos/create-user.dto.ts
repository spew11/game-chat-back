import { IsString, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(8, { message: '닉네임은 8자리 이하의 영문자와 숫자로만 가능합니다.' })
  @Matches(/^[a-zA-Z0-9]*$/, { message: '닉네임은 8자리 이하의 영문자와 숫자로만 가능합니다.' })
  nickname: string;
}
