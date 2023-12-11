import { AvatarEnum } from '../enums/avatar.enum';
import { Expose, Type } from 'class-transformer';
import { UserStatus } from '../enums/user-status.enum';
import { MatchHistoryDto } from './match-history.dto';
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
  @Expose()
  @Type(() => MatchHistoryDto)
  matchHistorys: MatchHistoryDto[];
  @Expose()
  status: UserStatus;
}
