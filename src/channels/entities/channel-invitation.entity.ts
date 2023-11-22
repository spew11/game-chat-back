import { User } from './../../users/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, UpdateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';

export enum InvitationStatus {
  Waiting = "waiting",
  Accepted = "accepted",
  Refused = "refused"
}

@Entity()
export class ChannelInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.channelInvitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitedUserId' })
  user: User;

  @ManyToOne(() => Channel, (channel) => channel.channelInvitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column({
    type: "enum",
    enum: InvitationStatus,
    default: InvitationStatus.Waiting
  })
  status: InvitationStatus;
}
