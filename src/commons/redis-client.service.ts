import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

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

  hset(key: string, field: string, value: number) {
    return this.redisClient.hset(key, field, value);
  }

  async hget(key: string, field: string) {
    return parseInt(await this.redisClient.hget(key, field)); // pipe
  }

  hdel(key: string, field: string) {
    this.redisClient.hdel(key, field);
  }
}
