import { Expose, Type } from 'class-transformer';
import { UserStatus } from '../enums/user-status.enum';
import { MatchHistoryDto } from './match-history.dto';

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
  avatarImgPath: string;
  @Expose()
  bio: string;
  @Expose()
  is2fa: boolean;
  @Expose()
  @Type(() => MatchHistoryDto)
  matchHistorys: MatchHistoryDto[];
  @Expose()
  status: UserStatus;
}
