import { Expose } from 'class-transformer';
import { ChannelRelationDto } from './channel-relation.dto';
import { ChannelDto } from './channel.dto';

export class ChannelMemberUpdateDto {
  @Expose()
  channel: ChannelDto;

  @Expose()
  channelRelation: ChannelRelationDto;
}
