import { IsEnum, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';
import { Optional } from '@nestjs/common';

export class ChannelDto {
  @IsString()
  @MaxLength(20)
  title: string;

  @IsString()
  @Optional()
  @ValidateIf((o) => o.type === ChannelType.protected)
  @MinLength(4)
  password: string;

  @IsEnum(ChannelType)
  type: ChannelType;
}
