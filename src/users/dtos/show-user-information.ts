import { Expose } from 'class-transformer';
import { AvatarEnum } from '../enums/avatar.enum';

export class ShowUserInforamtionDto {
  @Expose()
  id: number;
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
  @Expose()
  is2fa: boolean;
  // 전적 정보 추가
}
