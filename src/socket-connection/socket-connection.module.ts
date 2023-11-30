import { Module } from '@nestjs/common';
import { SocketConnectionGateway } from './socket-connection.gateway';
import { CommonsModule } from 'src/commons/commons.module';

@Module({
  imports: [CommonsModule],
  providers: [SocketConnectionGateway],
  exports: [SocketConnectionGateway],
})
export class SocketConnectionModule {}
