import { User } from './../../users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { ChannelRelation } from './channel-relation.entity';
import { MinLength } from 'class-validator';

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

  @ManyToOne(() => User, (user) => user.channels)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ChannelRelation, (channelRelation) => channelRelation.channel, {
    cascade: true,
  })
  channelRelations: ChannelRelation[];
}
