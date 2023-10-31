import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'}) // postgresql 버전
  createdAt: Date;

  @Column()
  isRead: boolean;
}
