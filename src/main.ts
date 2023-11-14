import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TestService } from './test.service';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { sessionMiddleware } from '@configs/session.config';
import { ValidationPipe } from '@nestjs/common';
import { readFileSync } from 'fs';
import { RedisService } from './commons/redis-client.service';
import { corsConfig } from '@configs/cors.config';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync(process.env.SSL_PATH + '/key.pem'),
    cert: readFileSync(process.env.SSL_PATH + '/cert.pem'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });
  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);

  app.enableCors(corsConfig);

  app.use(sessionMiddleware(configService, redisService), cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  // DB튜플 추가
  const testService = app.get(TestService);
  await testService.addUser();
  await testService.addUserRelation();

  await app.listen(configService.get<string>('SERVER_PORT'));
}
bootstrap();
