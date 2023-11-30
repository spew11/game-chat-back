import { Expose } from 'class-transformer';
import { ChannelDto } from './channel.dto';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';

export class ChannelMessageEmitDto {
  @Expose()
  channel: ChannelDto;

  @Expose()
  sender: ShowUserOverviewDto;

  @Expose()
  content: string;
}
