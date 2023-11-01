import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelMutedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  channel_id: number;

	@Column({ default: false })
  is_muted: boolean;

  @Column({ default: 5 })
  mutedTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.channelBannedUsers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.channelBannedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;
}
