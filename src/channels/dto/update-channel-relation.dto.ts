import { Optional } from '@nestjs/common';
import { IsBoolean } from 'class-validator';

export class UpdateChannelRelationDto {
  @IsBoolean()
  @Optional()
  isOwner: boolean;

  @IsBoolean()
  @Optional()
  isAdmin: boolean;

  @IsBoolean()
  @Optional()
  isBanned: boolean;
}
