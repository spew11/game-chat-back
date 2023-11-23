import { Expose, Transform } from 'class-transformer';
import { NotificationType } from '../enums/notification.enum';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';

export class NotiFriendRequestDto {
  @Expose()
  @Transform(() => NotificationType.FRIEND_REQUEST)
  type: NotificationType;

  @Expose({ name: 'otherUser' })
  requestringUser: ShowUserOverviewDto;

  @Expose()
  updatedAt: Date;
}
