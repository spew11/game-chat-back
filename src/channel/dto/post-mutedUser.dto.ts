import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMutedUserDto {
	@IsNotEmpty()
  	@IsNumber()
	user_id: number;

	@IsNotEmpty()
  	@IsNumber()
	channel_id: number;
}
