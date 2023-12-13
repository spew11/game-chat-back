import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { SecureShieldModule } from 'src/secure-shield/secure-shield.module';
import { SocketConnectionModule } from 'src/socket-connection/socket-connection.module';

@Module({
  imports: [UsersModule, ConfigModule, SecureShieldModule, SocketConnectionModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
