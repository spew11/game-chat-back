import { ConfigService } from '@nestjs/config';

const session = require('express-session');
<<<<<<< Updated upstream
const RedisStore = require('connect-redis').default;
=======
const RedisStore = require('connect-redis')(session);
>>>>>>> Stashed changes
const redis = require('redis');

const redisClient = redis.createClient({
  host: 'redis',
  port: 6379,
});

declare module 'express-session' {
  interface SessionData {
    email: string;
  }
}

export function sessionMiddleware(configService: ConfigService) {
  return session({
    secret: configService.get<string>('SESSION_SECRET'),
    resave: true, // 세션 갱신
    saveUninitialized: false, // 로그인한 사용자에게만 세션 ID할당하기
    store: new RedisStore({ client: redisClient }),
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      // sameSite: 'strict',
    },
    name: 'session-cookie',
  });
}

export { redisClient };
