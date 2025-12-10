import { PartialType } from '@nestjs/mapped-types';
import { CreatePushLogDto } from './create-push-log.dto';

export class UpdatePushLogDto extends PartialType(CreatePushLogDto) {}
