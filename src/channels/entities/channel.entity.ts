import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { ChannelRelation } from './channel-relation.entity';
import { MinLength } from 'class-validator';
import { ChannelInvitation } from './channel-invitation.entity';

export enum ChannelType {
  private,
  protected,
  public,
}

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  @MinLength(4)
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
