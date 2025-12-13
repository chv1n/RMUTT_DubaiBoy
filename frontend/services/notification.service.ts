import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Convert URL-safe base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isPushSupported()) {
        throw new Error('Push notifications are not supported');
    }
    return await Notification.requestPermission();
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
    }
}

/**
 * Get VAPID public key from backend
 */
export async function getVapidPublicKey(token: string): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/notifications/vapid-public-key`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.publicKey;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(token: string): Promise<PushSubscription | null> {
    if (!isPushSupported()) {
        console.warn('Push notifications not supported');
        return null;
    }

    try {
        // Request permission
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            console.warn('Notification permission denied');
            return null;
        }

        // Register service worker
        const registration = await registerServiceWorker();

        // Get VAPID public key from backend
        const vapidPublicKey = await getVapidPublicKey(token);
        if (!vapidPublicKey) {
            throw new Error('VAPID public key not available');
        }

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });

        console.log('Push subscription created:', subscription);

        // Send subscription to backend
        await sendSubscriptionToServer(subscription, token);

        return subscription;
    } catch (error) {
        console.error('Failed to subscribe to push:', error);
        throw error;
    }
}

/**
 * Send subscription to backend
 */
async function sendSubscriptionToServer(subscription: PushSubscription, token: string): Promise<void> {
    const subscriptionJson = subscription.toJSON();

    await axios.post(
        `${API_BASE_URL}/push-subscriptions/subscribe`,
        {
            endpoint: subscriptionJson.endpoint,
            p256dh: subscriptionJson.keys?.p256dh,
            auth: subscriptionJson.keys?.auth,
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    console.log('Subscription sent to server');
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            console.log('Unsubscribed from push notifications');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return false;
    }
}

/**
 * Check if currently subscribed
 */
export async function isSubscribedToPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription !== null;
    } catch {
        return false;
    }
}
