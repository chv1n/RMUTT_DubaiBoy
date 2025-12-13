import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, Put } from '@nestjs/common';
import { PushSubscriptionService } from './push-subscription.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller({
  path: 'push-subscriptions',
  version: '1',
})
export class PushSubscriptionController {
  constructor(private readonly service: PushSubscriptionService) { }

  @Post('subscribe')
  @UseGuards(AtGuard)
  async subscribe(@Body() body: CreatePushSubscriptionDto, @Req() req) {
    console.log("BODY RECEIVED:", body);
    const saved = await this.service.create(body, req.user?.id);
    return { message: 'Subscription saved', data: saved };
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async findAll(@Query() query: BaseQueryDto) {
    return this.service.findAll(query);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }


  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { message: 'Push subscription deleted successfully' };
  }


  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id/restore')
  async restore(@Param('id') id: string) {
    await this.service.restore(+id);
    return { message: 'Push subscription restored successfully' };
  }
}