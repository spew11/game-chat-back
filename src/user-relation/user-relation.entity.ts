import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/entities/user.entity";
import { UserRelationStatusEnum } from "src/enums/user-relation-status.enum";

@Entity()
export class UserRelation extends BaseEntity {
    // userRelation.userId 으로 접근하기 위해서 별도 필드 명시
    // @PrimaryColumn()
    // myId: number;

    // @PrimaryColumn()
    // relatedUserId: number;
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @ManyToOne(() => User)
    @JoinColumn()
    relatedUser: User;

    @Column({
        type: 'enum',
        enum: UserRelationStatusEnum,
    })
    status: UserRelationStatusEnum;
}