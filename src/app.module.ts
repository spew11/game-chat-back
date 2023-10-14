import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { typeORMConfig } from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UserRelationModule } from './user-relation/user-relation.module';
import { TestService } from './test.service';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(typeORMConfig),
    UsersModule,
    UserRelationModule
  ],
  providers: [TestService]
})
export class AppModule { }
