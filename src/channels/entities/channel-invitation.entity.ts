import { User } from './../../users/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.channelInvitations)
  @JoinColumn({ name: 'invitedUserId' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.channelInvitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;
}
