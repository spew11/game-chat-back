import { IsNumber, IsString } from 'class-validator';

export class ChannelMessageDto {
  @IsNumber()
  channelId: number;

  @IsString()
  content: string;
}
