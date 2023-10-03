import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

export enum RelationStatus {
    FRIEND_REQUEST = 'friendRequest',
    PENDING_APPROVAL = 'pendingApproval',
    BLOCKED = 'blocked',
    FRIEND = 'friend'
}

@Entity()
export class UserRelation extends BaseEntity {
    // userRelation.userId 으로 접근하기 위해서 별도 필드 명시
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    relatedUserId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'relatedUserId' })
    relatedUser: User;

    @Column({
        type: 'enum',
        enum: RelationStatus,
    })
    status: RelationStatus;
}