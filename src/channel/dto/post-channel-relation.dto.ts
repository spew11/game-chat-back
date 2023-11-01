import { IsString, IsNotEmpty, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateChannelRelationDto {
  @IsNotEmpty()
  @IsBoolean()
  is_admin: boolean;

  @IsString()
  password: string;

	@IsNotEmpty()
  @IsNumber()
  channel_id: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
