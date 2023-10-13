import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { MatchHistory } from './users/entities/match-history.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const usersService = app.get(UsersService);
  await usersService.testAddUser();
  await usersService.testAddHistories();
  const matches: MatchHistory[] =  await usersService.findAllMatchHistories();
  console.log(matches);
  await app.listen(4000);
}
bootstrap();
