import { Expose, Transform } from 'class-transformer';
import { NotificationType } from '../enums/notification.enum';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';

export class NotiChannelInviteDto {
  @Expose()
  @Transform(() => NotificationType.CHANNEL_INVITE)
  type: NotificationType;

  @Expose({ name: 'channel' })
  @Transform(({ value }) => value?.id)
  channelId: number;

  @Expose()
  invitingUser: ShowUserOverviewDto;
}
