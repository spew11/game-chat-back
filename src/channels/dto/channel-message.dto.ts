import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { User } from 'src/users/user.entity';

export class ChannelMessageDto {
  @IsNumber()
  @Expose()
  channelId: number;

  @Expose({ name: 'user' })
  sender: User;

  @IsString()
  @Expose()
  content: string;
}
