import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SendNotificationDto } from './dto';

@Controller({
    path: 'notifications',
    version: '1',
})
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly schedulerService: NotificationSchedulerService,
    ) { }

    /**
     * Get VAPID public key for frontend subscription
     */
    @Auth()
    @Get('vapid-public-key')
    getVapidPublicKey() {
        const key = this.notificationService.getVapidPublicKey();
        return {
            message: 'VAPID public key retrieved',
            data: { publicKey: key },
        };
    }

    /**
     * Send test notification (Admin only)
     */
    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Post('test')
    async sendTestNotification(@Body() dto: SendNotificationDto) {
        await this.notificationService.sendByType(dto.type, dto.title, dto.message, dto.data);
        return {
            message: 'Test notification sent',
        };
    }

    /**
     * Manually trigger notification checks (Admin only)
     */
    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Post('trigger-check')
    async triggerCheck(@Query('type') type: 'low_stock' | 'expiry' | 'deadlines' | 'reminder') {
        const result = await this.schedulerService.triggerManualCheck(type);
        return {
            message: result,
        };
    }
}
