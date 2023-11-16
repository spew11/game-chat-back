import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ChannelsService } from 'src/channels/channels.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private channelService: ChannelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const channelId = request.params.channel_id;

    if (!user || !channelId) {
      throw new BadRequestException('유저랑 채널 정보가 없습니다!');
    }

    const relation = await this.channelService.findChannelRelation(channelId, user.id);
    if (!relation || (!relation.isAdmin && !relation.isOwner)) {
      throw new ForbiddenException('소유자나 관리자가 아니면 접근할 수 없습니다!');
    }

    return true;
  }
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private channelService: ChannelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const channelId = request.params.channel_id;

    if (!user || !channelId) {
      throw new BadRequestException('유저랑 채널 정보가 없습니다!');
    }

    const relation = await this.channelService.findChannelRelation(channelId, user.id);

    if (!relation || !relation.isOwner) {
      throw new ForbiddenException('소유자가 아니면 접근할 수 없습니다!');
    }

    return true;
  }
}
