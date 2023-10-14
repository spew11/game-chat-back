import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true }) 
    email: string;

    @Column({ unique: true, nullable: true })
    nickname: string;

    @Column({ default: 0})
    ladderPoint: number;

    @Column({ default: "default image path"})
    avatar: string;

    @Column({ type: 'varchar', length:256, nullable: true})
    bio: string;

    @Column({ default: true})
    is2fa: boolean;

    // // LazyLoading으로 User에서 나의 MatchHistory를 필요할 때만 로드할 수 있게 함 
    // @OneToMany(() => MatchHistory, matchHistory => matchHistory.participantUserId)
    // participatedMatches: MatchHistory[]

    // @OneToMany(() => UserRelation, userRelation => userRelation.userId)
    // userRelationships: UserRelation[]
}