import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

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

  // @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP'}) // postgresql 버전
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Column()
  isRead: boolean;
}
