import { ConfigService } from '@nestjs/config';

declare module 'express-session' {
  interface SessionData {
    email: string;
  }
}

const session = require('express-session');
const MemoryStore = require('memorystore')(session);

export function sessionMiddleware(configService: ConfigService) {
  return session({
    secret: configService.get<string>('SESSION_SECRET'),
    resave: true, // 세션 갱신
    saveUninitialized: false,
    store: new MemoryStore(),
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
    },
    name: 'session-cookie',
  });
}
