import { PartialType } from '@nestjs/mapped-types';
import { ChannelCreationDto } from './post-channel.dto';

export class UpdateChannelDto extends PartialType(ChannelCreationDto) { }
