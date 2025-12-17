import { apiClient } from '@/lib/api/core/client';

class PushService {
    private readonly endpoint = '/push';

    async subscribe(subscription: PushSubscription): Promise<void> {
        // Send subscription as JSON. validation expects keys { p256dh, auth }
        await apiClient.post(`${this.endpoint}/subscribe`, subscription.toJSON());
    }

    async unsubscribe(endpoint: string): Promise<void> {
        await apiClient.post(`${this.endpoint}/unsubscribe`, { endpoint });
    }

    getVapidKey(): string | undefined {
        return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    }
}

export const pushService = new PushService();
