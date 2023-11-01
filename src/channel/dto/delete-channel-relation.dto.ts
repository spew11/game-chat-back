import { CreateChannelRelationDto } from './post-channel-relation.dto';
import { IsString, IsNotEmpty, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

export class DeleteChannelRelationDto extends OmitType(CreateChannelRelationDto, ['is_admin', 'password'] as const) { }
