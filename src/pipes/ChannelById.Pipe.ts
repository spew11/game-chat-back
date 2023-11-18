import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ChannelsService } from 'src/channels/channels.service';
​
@Injectable()
export class ChannelByIdPipe implements PipeTransform<number> {
  constructor(private readonly channelService: ChannelsService) {}
​
  async transform(id: number) {
    const channel = await this.channelService.findOneChannel(id);
    if (!channel) {
      throw new NotFoundException('존재하지 않는 채널입니다.');
    }
    return channel;
  }
}
