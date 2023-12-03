import { IsEnum, IsString, Matches, MaxLength } from 'class-validator';
import { AvatarEnum } from '../enums/avatar.enum';

export class UpdateUserDto {
  @IsString()
  @Matches(/^[\da-zA-Z가-힣]{1,8}$/, {
    message: '닉네임은 8자리 이하의 한글, 영문자, 숫자로만 가능합니다.',
  })
  nickname: string;
  @IsEnum(AvatarEnum, { message: '아바타는 0부터 5 사이의 숫자여야 합니다.' })
  avatar: AvatarEnum;
  @IsString()
  @MaxLength(20, { message: '자기소개는 20자 이내만 가능합니다.' })
  bio: string;
}
