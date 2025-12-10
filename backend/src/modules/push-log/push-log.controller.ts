import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PushLogService } from './push-log.service';
import { CreatePushLogDto } from './dto/create-push-log.dto';
import { UpdatePushLogDto } from './dto/update-push-log.dto';

@Controller('push-log')
export class PushLogController {
  constructor(private readonly pushLogService: PushLogService) {}

  @Post()
  create(@Body() createPushLogDto: CreatePushLogDto) {
    return this.pushLogService.create(createPushLogDto);
  }

  @Get()
  findAll() {
    return this.pushLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pushLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePushLogDto: UpdatePushLogDto) {
    return this.pushLogService.update(+id, updatePushLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pushLogService.remove(+id);
  }
}
