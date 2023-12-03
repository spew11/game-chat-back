import { Expose } from 'class-transformer';
import { UserRelationStatusEnum } from '../enums/user-relation-status.enum';
import { ShowUserIdDto } from './show-user-id.dto';

export class ShowFriendRelationsDto {
  @Expose()
  otherUser: ShowUserIdDto;
  @Expose()
  status: UserRelationStatusEnum;
}
