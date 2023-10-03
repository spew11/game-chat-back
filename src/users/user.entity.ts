import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { MatchHistory } from "./match-history.entity";
import { UserRelation } from "./user-relation.entity";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    // @Column()
    // accessToken: string;

    // @Column({ unique: true })
    // email: string;

    @Column({ unique: true })
    nickname: string;

    @Column({ default: 0})
    ladderPoint: number;

    @Column({ default: "deafult image path"})
    abatar: string;

    @Column({ nullable: true})
    bio: string;

    @Column({ default: true})
    is2fa: boolean;

    // LazyLoading으로 User에서 나의 MatchHistory를 필요할 때만 로드할 수 있게 함 
    @OneToMany(() => MatchHistory, matchHistory => matchHistory.participantUserId)
    participatedMatches: MatchHistory[]

    @OneToMany(() => UserRelation, userRelation => userRelation.userId)
    userRelationships: UserRelation[]
}