import { Module, forwardRef } from '@nestjs/common';
import { RedisService } from './redis-client.service';
import { MainGateway } from './main.gateway';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [forwardRef(() => ChannelsModule)],
  providers: [RedisService, MainGateway],
  exports: [RedisService, MainGateway],
})
export class CommonsModule {}
