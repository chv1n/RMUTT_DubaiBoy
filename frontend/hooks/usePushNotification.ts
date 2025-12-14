import { useState, useEffect } from 'react';
import { pushService } from '@/services/push.service';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotification() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.pushManager.getSubscription().then(sub => {
                        setSubscription(sub);
                        if (sub) {
                            // Sync with backend on load to ensure user association
                            pushService.subscribe(sub).catch(e => console.error("Sync failed", e));
                        }
                    });
                });
            }
        }
    }, []);

    const subscribe = async () => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            if (perm === 'granted') {
                const key = pushService.getVapidKey();
                if (!key) {
                    console.error('VAPID Key not found - check environment variables');
                    return;
                }

                // Ensure SW is registered. Assuming main app registers it, but force check here.
                let registration = await navigator.serviceWorker.ready;
                if (!registration) {
                    registration = await navigator.serviceWorker.register('/sw.js');
                }

                let sub = await registration.pushManager.getSubscription();
                if (!sub) {
                    sub = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(key)
                    });
                }

                // Send to backend
                await pushService.subscribe(sub);
                setSubscription(sub);
            }
        } catch (e) {
            console.error('Failed to subscribe', e);
        }
    };

    const unsubscribe = async () => {
        if (subscription) {
            await subscription.unsubscribe();
            await pushService.unsubscribe(subscription.endpoint);
            setSubscription(null);
        }
    };

    return { permission, subscription, subscribe, unsubscribe };
}
