import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeORMConfigProvider {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      namingStrategy: new SnakeNamingStrategy(),
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST'),
      port: 5432,
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DB'),
      entities: [__dirname + '/../**/*.entity.{js, ts}'],
      synchronize: this.configService.get<string>('POSTGRES_SYNCHRONIZE') === 'true',
      dropSchema: this.configService.get<string>('POSTGRES_DROP_SCHEMA') === 'true',
    };
  }
}
