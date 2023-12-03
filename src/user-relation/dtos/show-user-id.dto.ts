import { Expose } from 'class-transformer';

export class ShowUserIdDto {
  @Expose()
  id: number;
  @Expose()
  nickname: string;
}
