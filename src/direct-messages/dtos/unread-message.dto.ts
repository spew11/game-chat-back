import { Expose, Transform } from 'class-transformer';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';

export class unreadMassageDto {
  @Expose({ name: 'message_sender_id' })
  @Transform(({ value }) => {
    return {
      sender: {
        id: value,
      },
    };
  })
  sender: ShowUserOverviewDto;

  @Expose()
  @Transform(({ value }) => (parseInt(value) ? parseInt(value) : 0))
  count: number;
}
