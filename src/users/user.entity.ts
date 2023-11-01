import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelBannedUser } from 'src/channel/entities/channel-bannedUser.entity';
import { ChannelRelation } from 'src/channel/entities/channel-relation.entity';
import { ChannelMutedUser } from 'src/channel/entities/channel-mutedUser.entity';
import { Channel } from 'src/channel/entities/channel.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ default: 0 })
  ladderPoint: number;

  @Column({ default: 'default image path' })
  avatar: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  bio: string;

  @Column({ default: true })
  is2fa: boolean;

  @OneToMany(() => Channel, (channel) => channel.user)
  	channels: Channel[];

  @OneToMany(() => ChannelRelation, (channelRelation) => channelRelation.user)
  	channelRelations: ChannelRelation[];

  @OneToMany(() => ChannelBannedUser, (channelBannedUser) => channelBannedUser.user)
  	channelBannedUsers: ChannelBannedUser[];

  @OneToMany(() => ChannelMutedUser, (channelMutedUser) => channelMutedUser.user)
 	channelMutedUsers:  ChannelMutedUser[];
}
