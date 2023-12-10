import { Expose, Transform } from 'class-transformer';
import { NotificationType } from '../enums/notification.enum';
import { GameMode } from 'src/games/enums/game-mode.enum';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';

export class NotiGameInviteDto {
  @Expose()
  @Transform(() => NotificationType.GAME_INVITE)
  type: NotificationType;

  @Expose()
  invitingUser: ShowUserOverviewDto;

  @Expose()
  mode: GameMode;
}
