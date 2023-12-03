import { IsEnum, IsString, Matches, MaxLength } from 'class-validator';
import { AvatarEnum } from '../enums/avatar.enum';

export class UpdateUserDto {
  @IsString()
  @MaxLength(8, { message: '닉네임은 8자리 이하의 영문자와 숫자로만 가능합니다.' })
  @Matches(/^[a-zA-Z0-9]*$/, { message: '닉네임은 8자리 이하의 영문자와 숫자로만 가능합니다.' })
  nickname: string;
  @IsEnum(AvatarEnum, { message: '아바타는 0부터 5 사이의 숫자여야 합니다.' })
  avatar: AvatarEnum;
  @MaxLength(60, { message: '자기소개는 최대 60자까지 가능합니다.' })
  bio: string;
}
