import { Injectable } from '@nestjs/common';
import { CreatePushLogDto } from './dto/create-push-log.dto';
import { UpdatePushLogDto } from './dto/update-push-log.dto';

@Injectable()
export class PushLogService {
  create(createPushLogDto: CreatePushLogDto) {
    return 'This action adds a new pushLog';
  }

  findAll() {
    return `This action returns all pushLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pushLog`;
  }

  update(id: number, updatePushLogDto: UpdatePushLogDto) {
    return `This action updates a #${id} pushLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} pushLog`;
  }
}
