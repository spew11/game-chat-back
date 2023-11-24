import { Expose } from 'class-transformer';
import { User } from 'src/users/user.entity';

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
  user: User;
}
