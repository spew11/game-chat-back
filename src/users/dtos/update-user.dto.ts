import { IsString, Matches, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Matches(/^[\da-zA-Z가-힣]{1,8}$/, {
    message: '닉네임은 8자리 이하의 한글, 영문자, 숫자로만 가능합니다.',
  })
  nickname: string;
  @IsString()
  @MaxLength(20, { message: '자기소개는 20자 이내만 가능합니다.' })
  bio: string;
}
