import { ConfigService } from '@nestjs/config';

const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

export const redisClient = redis.createClient({
  url: 'redis://redis:6379',
  legacyMode: true, // 이거 안하면 connect-redis 작동안함
});

redisClient.on('connect', () => {
  console.info('Redis connected!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect().then(); // redis 4.X 버전은 클라이언트를 수동으로 연결시켜줘야 함

export const redisCli = redisClient.v4;

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
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      // sameSite: 'strict',
    },
    store: new RedisStore({ client: redisClient, prefix: 'session:' }),
    name: 'session-cookie',
  });
}
