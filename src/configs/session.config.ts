import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { Redis } from 'ioredis';

const redisClient = new Redis({
  host: 'redis',
  port: 6379,
});

redisClient.on('connect', () => {
  console.info('Redis connected!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

declare module 'express-session' {
  interface SessionData {
    email: string;
  }
}

export function sessionMiddleware(configService: ConfigService) {
  return session({
    secret: configService.get<string>('SESSION_SECRET'),
    resave: false, // 세션 갱신
    saveUninitialized: false, // 로그인한 사용자에게만 세션 ID할당하기
    cookie: {
      path: '/',
      maxAge: 30 * 60 * 1000,
      httpOnly: false,
      sameSite: 'none',
      secure: false,
    },
    store: new RedisStore({ client: redisClient, prefix: 'session:' }),
    // name: 'session-cookie',
  });
}
