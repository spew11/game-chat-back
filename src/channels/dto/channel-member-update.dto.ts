import { Expose } from 'class-transformer';
import { ChannelRelation } from '../entities/channel-relation.entity';

export class ChannelMemberUpdateDto {
  @Expose()
  channelId: number;

  @Expose()
  channelRelation: ChannelRelation;
}
