export class UserInfoDto {
	id: number;
	nickname: string;
}

export class ChannelInfoDto {
	id: number;
	title: string;
	type: string;
}

export class ChannelInvitationDto {
	user: UserInfoDto;
	channel: ChannelInfoDto;
}
