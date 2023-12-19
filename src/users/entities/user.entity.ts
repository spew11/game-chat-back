import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ChannelRelation } from 'src/channels/entities/channel-relation.entity';
import { ChannelInvitation } from '../../channels/entities/channel-invitation.entity';
import { MatchHistory } from './match-history.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ default: 1000 })
  ladderPoint: number;

  @Column({ nullable: true })
  avatarImgPath: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: false })
  is2fa: boolean;

  @Column({ nullable: true })
  otpSecret: string;

  @OneToMany(() => ChannelRelation, (channelRelation) => channelRelation.user)
  channelRelations: ChannelRelation[];

  @OneToMany(() => ChannelInvitation, (channelInvitation) => channelInvitation.user)
  channelInvitations: ChannelInvitation[];

  @OneToMany(() => MatchHistory, (matchHistory) => matchHistory.user)
  matchHistorys: MatchHistory[];
}
