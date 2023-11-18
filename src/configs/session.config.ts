import { ConfigService } from '@nestjs/config';
import session, { Session } from 'express-session';
import RedisStore from 'connect-redis';
import { RedisService } from 'src/commons/redis-client.service';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}
declare module 'http' {
  interface IncomingMessage {
    session: Session & Partial<session.SessionData>;
  }
}

export function sessionMiddleware(configService: ConfigService, redisService: RedisService) {
  return session({
    secret: configService.get<string>('SESSION_SECRET'),
    resave: false, // resave: 사용자의 api호출시 마다 session기한을 연장하는 설정.
    saveUninitialized: false, // saveUninitialized 로그인한 사용자에게만 세션ID을 할당하는 설정.
    cookie: {
      path: '/',
      maxAge: 30 * 60 * 1000,
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    },
    store: new RedisStore({ client: redisService.client, prefix: 'session:' }), // prefix: session key에 접두사를 붙여서 구별하기 용이하게 하는 역할
    name: 'session-cookie', // name: 세션 쿠키 이름 (ex. Set-Cookie: session-cookie=encoded sessionID)
  });
}
