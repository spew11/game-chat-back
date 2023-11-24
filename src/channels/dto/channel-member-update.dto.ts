import { Expose } from 'class-transformer';
import { ChannelRelationDto } from './channel-relation.dto';

export class ChannelMemberUpdateDto {
  @Expose()
  channelId: number;

  @Expose()
  channelRelation: ChannelRelationDto;
}
