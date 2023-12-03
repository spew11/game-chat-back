import { ShowUserIdDto } from 'src/user-relation/dtos/show-user-id.dto';
import { ChannelInfoDto } from './channel-info.dto';

export class ChannelInvitationDto {
  user: ShowUserIdDto;
  channel: ChannelInfoDto;
}
