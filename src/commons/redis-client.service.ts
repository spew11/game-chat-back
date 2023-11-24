import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Socket } from 'socket.io';
import { RedisField } from './enums/redis.enum';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'redis',
      port: 6379,
    });

    this.redisClient.on('connect', () => {
      console.info('Redis connected!');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  get client(): Redis {
    return this.redisClient;
  }

  hset(key: string | number, field: string, value: string | number) {
    const formattedKey = typeof key === 'number' ? key.toString() : key;

    return this.redisClient.hset(formattedKey, field, value);
  }

  hget(key: string | number, field: string) {
    const formattedKey = typeof key === 'number' ? key.toString() : key;

    return this.redisClient.hget(formattedKey, field);
  }

  hdel(key: string | number, field: string) {
    const formattedKey = typeof key === 'number' ? key.toString() : key;

    return this.redisClient.hdel(formattedKey, field);
  }

  async socketToUser(socketId: string): Promise<number> {
    const userId = parseInt(await this.hget(socketId, RedisField.SOCKET_TO_USER));
    return userId;
  }

  async userToSocket(userId: number): Promise<string | null> {
    const socketId = await this.hget(userId, RedisField.USER_TO_SOCKER);
    return socketId;
  }

  async getUserIdBySession(clientSocket: Socket): Promise<number | undefined> {
    let session = clientSocket.request.session;
    if (!session.userId) {
      const sessionId = clientSocket.request.headers.authorization;
      session = JSON.parse(await this.client.get('session:' + sessionId));
    }
    return session?.userId;
  }
}
