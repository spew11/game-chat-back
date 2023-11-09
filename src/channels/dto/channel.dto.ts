import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';
import { Optional } from '@nestjs/common';

export class ChannelDto {
  @IsString()
  @MaxLength(20)
  title: string;

  @IsString()
  @Optional()
  @MinLength(4)
  password: string;

  @IsEnum(ChannelType)
  type: ChannelType;
}
