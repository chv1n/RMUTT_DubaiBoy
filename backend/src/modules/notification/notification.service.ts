import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { PushSubscription } from '../push-subscription/entities/push-subscription.entity';
import { PushLog } from '../push-log/entities/push-log.entity';
import { User } from '../user/entities/user.entity';
import { NotificationType, NotificationRoleMapping } from './enums';
import { Role } from 'src/common/enums/role.enum';

export interface NotificationPayload {
    title: string;
    message: string;
    type: NotificationType;
    url?: string;
    data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectRepository(PushSubscription)
        private readonly subscriptionRepo: Repository<PushSubscription>,
        @InjectRepository(PushLog)
        private readonly pushLogRepo: Repository<PushLog>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly configService: ConfigService,
    ) {
        this.initWebPush();
    }

    private initWebPush() {
        const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
        const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
        const subject = this.configService.get<string>('VAPID_SUBJECT') || 'mailto:admin@example.com';

        if (publicKey && privateKey) {
            webpush.setVapidDetails(subject, publicKey, privateKey);
            this.logger.log('Web Push VAPID keys configured');
        } else {
            this.logger.warn('VAPID keys not configured. Push notifications will not work.');
        }
    }

    /**
     * Send notification to a specific user
     */
    async sendToUser(userId: number, payload: NotificationPayload): Promise<void> {
        const subscriptions = await this.subscriptionRepo.find({
            where: { user_id: userId },
        });

        if (subscriptions.length === 0) {
            this.logger.debug(`No subscriptions found for user ${userId}`);
            return;
        }

        await this.sendToSubscriptions(subscriptions, payload);
    }

    /**
     * Send notification to all users with specific roles
     */
    async sendToRoles(roles: Role[], payload: NotificationPayload): Promise<void> {
        // Find users with specified roles
        const users = await this.userRepo.find({
            where: { role: In(roles), is_active: true },
            select: ['id'],
        });

        if (users.length === 0) {
            this.logger.debug(`No active users found with roles: ${roles.join(', ')}`);
            return;
        }

        const userIds = users.map(u => u.id);

        // Find subscriptions for these users
        const subscriptions = await this.subscriptionRepo.find({
            where: { user_id: In(userIds) },
        });

        if (subscriptions.length === 0) {
            this.logger.debug(`No subscriptions found for users with roles: ${roles.join(', ')}`);
            return;
        }

        await this.sendToSubscriptions(subscriptions, payload);
    }

    /**
     * Send notification based on notification type (uses role mapping)
     */
    async sendByType(type: NotificationType, title: string, message: string, data?: Record<string, any>): Promise<void> {
        const roles = NotificationRoleMapping[type];
        if (!roles || roles.length === 0) {
            this.logger.warn(`No role mapping found for notification type: ${type}`);
            return;
        }

        const payload: NotificationPayload = {
            type,
            title,
            message,
            data,
        };

        await this.sendToRoles(roles, payload);
    }

    /**
     * Send push notification to multiple subscriptions
     */
    private async sendToSubscriptions(subscriptions: PushSubscription[], payload: NotificationPayload): Promise<void> {
        const pushPayload = JSON.stringify({
            title: payload.title,
            body: payload.message,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: {
                type: payload.type,
                url: payload.url || '/',
                ...payload.data,
            },
        });

        const sendPromises = subscriptions.map(async (subscription) => {
            try {
                const pushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.p256dh,
                        auth: subscription.auth,
                    },
                };

                await webpush.sendNotification(pushSubscription, pushPayload);

                // Log successful push
                await this.logPush(subscription, payload, 'SUCCESS');

                this.logger.debug(`Push sent to subscription ${subscription.id}`);
            } catch (error) {
                this.logger.error(`Failed to send push to subscription ${subscription.id}: ${error.message}`);

                // Log failed push
                await this.logPush(subscription, payload, 'FAILED', error.message);

                // If subscription is no longer valid, mark it for deletion
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await this.subscriptionRepo.softDelete(subscription.id);
                    this.logger.warn(`Subscription ${subscription.id} removed (expired)`);
                }
            }
        });

        await Promise.allSettled(sendPromises);
    }

    /**
     * Log push notification attempt
     */
    private async logPush(
        subscription: PushSubscription,
        payload: NotificationPayload,
        status: 'SUCCESS' | 'FAILED',
        errorMessage?: string,
    ): Promise<void> {
        try {
            const pushLog = this.pushLogRepo.create({
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                title: payload.title,
                message: payload.message,
                payload_json: payload.data,
                status,
                error_message: errorMessage,
            });
            await this.pushLogRepo.save(pushLog);
        } catch (error) {
            this.logger.error(`Failed to log push: ${error.message}`);
        }
    }

    /**
     * Get VAPID public key for frontend subscription
     */
    getVapidPublicKey(): string | undefined {
        return this.configService.get<string>('VAPID_PUBLIC_KEY');
    }
}
