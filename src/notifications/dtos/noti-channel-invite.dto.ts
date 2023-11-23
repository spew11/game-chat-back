import { Expose, Transform } from 'class-transformer';
import { NotificationType } from '../enums/notification.enum';

export class NotiChannelInviteDto {
  @Expose()
  @Transform(() => NotificationType.CHANNEL_INVITE)
  type: NotificationType;

  @Expose({ name: 'channel' })
  @Transform(({ value }) => value?.id)
  channelId: number;

  @Expose()
  updatedAt: Date;
}
