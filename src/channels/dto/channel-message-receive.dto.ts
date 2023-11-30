import { IsNumber, IsString } from 'class-validator';

export class ChannelMessageReceiveDto {
  @IsNumber()
  channelId: number;

  @IsString()
  content: string;
}
