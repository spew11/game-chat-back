import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelationModule } from './user-relation/user-relation.module';
import { UsersModule } from './users/users.module';
import { TypeORMConfigProvider } from '@configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { TestService } from './test.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeORMConfigProvider,
    }),
    UserRelationModule,
    UsersModule,
    AuthModule,
    ChannelModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NotificationsModule,
  ],
  providers: [TestService],
})
export class AppModule {}
