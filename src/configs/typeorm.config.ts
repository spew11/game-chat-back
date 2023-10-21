import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "./snake-naming.strategy";

export const typeORMConfig : TypeOrmModuleOptions = {
    type: 'sqlite',
    database: 'transendence.sqlite',
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
    dropSchema: true,
    namingStrategy: new SnakeNamingStrategy(),
    // type: 'postgres',
    // host: 'localhost',
    // port: 5432,
    // username: 'postgres',
    // password: '1',
    // database: 'postgres',
    // entities: [__dirname + '/../**/*.entity.{js, ts}'],
    // synchronize: true,
    // dropSchema: true,
    // namingStrategy: new SnakeNamingStrategy(),
}