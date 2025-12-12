import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PushLogService } from './push-log.service';
import { CreatePushLogDto } from './dto/create-push-log.dto';
import { UpdatePushLogDto } from './dto/update-push-log.dto';

@Controller({
  path: 'push-logs',
  version: '1',
})
export class PushLogController {
  constructor(private service: PushLogService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}