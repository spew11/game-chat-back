import { Controller } from '@nestjs/common';
import { UserRelationStatusEnum } from 'src/user-relation/enums/user-relation-status.enum';
import { User } from 'src/users/user.entity';

@Controller()
export class CreateUserRelationDto {
  user: User;
  otherUser: User;
  status: UserRelationStatusEnum;
}
