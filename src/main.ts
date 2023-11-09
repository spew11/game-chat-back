import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TestService } from './test.service';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { sessionMiddleware } from '@configs/session.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.use(sessionMiddleware(configService), cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000', 'https://develop.d35lpok7005dz1.amplifyapp.com'], // 요청을 보내는 클라이언트의 주소를 명시
    credentials: true,
  });

  // DB튜플 추가
  const testService = app.get(TestService);
  await testService.addUser();
  await testService.addUserRelation();

  await app.listen(configService.get<string>('SERVER_PORT'));
}
bootstrap();
