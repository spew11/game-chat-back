import { IsString, IsNotEmpty, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

export class ChannelCreationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  title: string;

  @IsString()
  password: string;

  @IsNotEmpty()
  type: ChannelType;
}
