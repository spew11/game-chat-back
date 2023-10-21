import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true }) 
    email: string;

    @Column({ unique: true })
    nickname: string;

    @Column({ default: 0})
    ladderPoint: number;

    @Column({ default: "default image path"})
    avatar: string;

    @Column({ type: 'varchar', length:256, nullable: true})
    bio: string;
    
    @Column({ default: true})
    is2fa: boolean;
}