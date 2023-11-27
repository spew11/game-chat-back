import { Expose } from 'class-transformer';
import { ShowUserOverviewDto } from 'src/users/dtos/show-user-overview.dto';

export class ChannelRelationDto {
  @Expose()
  id: number;

  @Expose()
  isAdmin: boolean;

  @Expose()
  isOwner: boolean;

  @Expose()
  createdAt: Date;

  // @Column({ nullable: true, type: 'timestamp' })
  // muteUntil: Date;

  @Expose()
  user: ShowUserOverviewDto;
}
