import { UserRoleDto } from "./channel-user-role.dto";

export class ChannelWithUsersDto {
	id: number;
	title: string;
	type: string;
	users: UserRoleDto[];
  }
