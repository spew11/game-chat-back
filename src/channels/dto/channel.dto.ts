import { IsEnum, IsString, MaxLength, MinLength, IsNotEmpty } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';
import { Optional } from '@nestjs/common';

export class ChannelDto {
  @IsString()
  @MaxLength(20)
  title: string;

  @IsString()
  @Optional()
  @IsNotEmpty({ groups: [ChannelType.protected] }) // proteced만 패스워드가 필요하게 만든다
  @MinLength(4)
  password: string;

  @IsEnum(ChannelType, {
    each: true, // enum값의 숫자 허용
  })
  type: ChannelType;
}
