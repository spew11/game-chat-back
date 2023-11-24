import { Module } from '@nestjs/common';
import { NotificationsEmitGateway } from './notifications-emit.gateway';

@Module({
  imports: [],
  providers: [NotificationsEmitGateway],
  exports: [NotificationsEmitGateway],
})
export class NotificationsModule {}
