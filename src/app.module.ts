import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { typeORMConfig } from './configs/typeorm.config';

@Module({
  
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UsersModule
  ],
})
export class AppModule {}
