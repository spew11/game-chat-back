import { IsEnum, IsString, MaxLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';
import { Expose } from 'class-transformer';

export class ChannelDto {
  @Expose()
  id: number;

  @Expose()
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  password?: string; // ? 이것으로 public private 채널에서 비밀번호를 필요 없게 만든다

  @Expose()
  @IsEnum(ChannelType)
  type: ChannelType;
}
