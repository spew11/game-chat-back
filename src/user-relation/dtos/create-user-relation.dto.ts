import { UserRelationStatusEnum } from 'src/user-relation/enums/user-relation-status.enum';
import { User } from 'src/users/entities/user.entity';

export class CreateUserRelationDto {
  user: User;
  otherUser: User;
  status: UserRelationStatusEnum;
}
