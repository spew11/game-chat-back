import { UserRelationStatusEnum } from '../enums/user-relation-status.enum';

export class ShowFriendRelationsDto {
  otherUserId: number;
  nickname: string;
  status: UserRelationStatusEnum;
}
