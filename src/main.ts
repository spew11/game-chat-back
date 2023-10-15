import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TestService } from './test.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // DB튜플 추가
  const testService = app.get(TestService);
  await testService.addUser();
  await testService.addUserRelation();

  await app.listen(4000);
}
bootstrap();
