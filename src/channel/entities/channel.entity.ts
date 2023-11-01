import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ChannelRelation } from './channel-relation.entity';
import { ChannelBannedUser } from './channel-bannedUser.entity';
import { ChannelMutedUser } from './channel-mutedUser.entity';

export enum ChannelType {
  private,
  protected,
  public
}

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false})
  title: string;

  @Column()
  owner_id: number;

  @Column({ length: 50, nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.public,
  })
  type: ChannelType;

  @ManyToOne(() => User, (user) => user.channels)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ChannelRelation, (channelRelation) => channelRelation.channel,
  {
    cascade: true,
    })
  channelRelations: ChannelRelation[];

  @OneToMany(() => ChannelBannedUser, (channelBannedUser) => channelBannedUser.channel, {
    cascade: true,
    })
  channelBannedUsers: ChannelBannedUser[];

  @OneToMany(() => ChannelMutedUser, (channelMutedUser) => channelMutedUser.channel, {
    cascade: true,
    })
  channelMutedUsers:  ChannelMutedUser[];
}
