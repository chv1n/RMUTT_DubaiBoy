import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, Put } from '@nestjs/common';
import { PushSubscriptionService } from './push-subscription.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

@Controller({
  path: 'push',
  version: '1',
})
export class PushSubscriptionController {
  constructor(private readonly service: PushSubscriptionService) { }

  @Post('subscribe')
  @UseGuards(AtGuard)
  async subscribe(@Body() body: CreatePushSubscriptionDto, @Req() req) {
    const saved = await this.service.create(body, req.user?.id);
    return { message: 'Subscription saved', data: saved };
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() body: { endpoint: string }) {
    await this.service.deleteByEndpoint(body.endpoint);
    return { message: 'Unsubscribed successfully' };
  }

  @Post('test')
  @UseGuards(AtGuard)
  async sendTestNotification(@Req() req, @Body() body: { message?: string }) {
    const userId = req.user.id;
    const payload = {
      title: 'Test Notification',
      body: body.message || 'This is a test notification from the API.',
      data: { url: '/' }
    };
    await this.service.sendNotification(userId, payload);
    return { message: 'Test notification sent' };
  }

  @Post('low-stock')
  @UseGuards(AtGuard)
  async sendTestLowStockNotification(@Body() body: { materialName?: string, current?: number, min?: number }) {
    const payload = {
      title: 'Low Stock Alert',
      body: `Material ${body.materialName || 'Test Material (Manual Check)'} is running low. Current: ${body.current ?? 5} (Min: ${body.min ?? 10})`,
      data: { url: '/inventory' }
    };

    // Send to all relevant roles to simulate the real system event
    await this.service.sendToRoles(['admin', 'staff', 'super_admin', 'user'], payload);
    return { message: 'Low stock test notification sent to admins/staff' };
  }

  @Get()
  async findAll(@Query() query: BaseQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }


  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { message: 'Push subscription deleted successfully' };
  }


  @Put(':id/restore')
  async restore(@Param('id') id: string) {
    await this.service.restore(+id);
    return { message: 'Push subscription restored successfully' };
  }
}