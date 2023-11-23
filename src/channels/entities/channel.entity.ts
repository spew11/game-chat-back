import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ChannelRelation } from './channel-relation.entity';
import { ChannelInvitation } from './channel-invitation.entity';

export enum ChannelType {
  private = 'private',
  protected = 'protected',
  public = 'public',
}

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.public,
  })
  type: ChannelType;

  @OneToMany(() => ChannelRelation, (channelRelation) => channelRelation.channel)
  channelRelations: ChannelRelation[];

  @OneToMany(() => ChannelInvitation, (channelInvitation) => channelInvitation.channel)
  channelInvitations: ChannelInvitation[];
}
