import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
