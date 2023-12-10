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

  get(key: string | number) {
    const formattedKey = typeof key === 'number' ? key.toString() : key;

    return this.redisClient.get(formattedKey);
  }

  setex(key: string | number, second: number, value: string | number) {
    const formattedKey = typeof key === 'number' ? key.toString() : key;

    return this.redisClient.setex(formattedKey, second, value);
  }

  getdel(key: string | number) {
    const formattedKey = typeof key === 'number' ? key.toString() : key;

    return this.redisClient.getdel(formattedKey);
  }

  del(key: string | number) {
    const formattedKey = typeof key === 'number' ? key.toString() : key;

    return this.redisClient.del(formattedKey);
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
}
