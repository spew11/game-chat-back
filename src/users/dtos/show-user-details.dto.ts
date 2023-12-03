import { AvatarEnum } from '../enums/avatar.enum';
import { Expose } from 'class-transformer';
export class ShowUserDetailsDto {
  @Expose()
  email: string;
  @Expose()
  nickname: string;
  @Expose()
  ladderPoint: number;
  @Expose()
  avatar: AvatarEnum;
  @Expose()
  bio: string;
  // 전적 정보 추가
}
