import { Expose, Transform } from 'class-transformer';
import { NotificationType } from '../enums/notification.enum';
import { ChannelDto } from 'src/channels/dto/channel.dto';

export class NotiChannelInviteDto {
  @Expose()
  @Transform(() => NotificationType.CHANNEL_INVITE)
  type: NotificationType;

  @Expose()
  channel: ChannelDto;

  @Expose()
  updatedAt: Date;
}
