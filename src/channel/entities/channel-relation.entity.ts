import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelRelation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  is_admin: boolean;

  @Column()
  user_id: number;

  @Column()
  channel_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.channelRelations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.channelRelations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;
}
