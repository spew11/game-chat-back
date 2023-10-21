import { ConfigService } from '@nestjs/config';

declare module 'express-session' {
  interface SessionData {
    email: string;
  }
}

var session = require('express-session');
const MemoryStore = require('memorystore')(session);

export function sessionMiddleware(configService: ConfigService) {
  return session({
    secret: configService.get<string>('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore(),
    cookie: {
      maxAge: 2000,
      httpOnly: true,
    },
    name: 'session-cookie'
  });
}