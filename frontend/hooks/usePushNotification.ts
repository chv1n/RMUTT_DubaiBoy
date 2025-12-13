'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    isPushSupported,
    getNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribedToPush,
    registerServiceWorker,
} from '@/services/notification.service';

interface UsePushNotificationResult {
    isSupported: boolean;
    permission: NotificationPermission | 'unsupported';
    isSubscribed: boolean;
    isLoading: boolean;
    error: string | null;
    subscribe: (token: string) => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    checkSubscription: () => Promise<void>;
}

export function usePushNotification(): UsePushNotificationResult {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check support and permission on mount
    useEffect(() => {
        const checkSupport = async () => {
            const supported = isPushSupported();
            setIsSupported(supported);

            if (supported) {
                setPermission(getNotificationPermission());

                // Register service worker
                try {
                    await registerServiceWorker();
                } catch (e) {
                    console.error('Failed to register SW:', e);
                }

                // Check if already subscribed
                const subscribed = await isSubscribedToPush();
                setIsSubscribed(subscribed);
            }
        };

        checkSupport();
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async (token: string): Promise<boolean> => {
        if (!isSupported) {
            setError('Push notifications are not supported');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const subscription = await subscribeToPush(token);
            if (subscription) {
                setIsSubscribed(true);
                setPermission('granted');
                return true;
            } else {
                setError('Failed to subscribe - permission denied or error');
                return false;
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to subscribe';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const success = await unsubscribeFromPush();
            if (success) {
                setIsSubscribed(false);
            }
            return success;
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to unsubscribe';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check current subscription status
    const checkSubscription = useCallback(async (): Promise<void> => {
        if (isSupported) {
            const subscribed = await isSubscribedToPush();
            setIsSubscribed(subscribed);
            setPermission(getNotificationPermission());
        }
    }, [isSupported]);

    return {
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        error,
        subscribe,
        unsubscribe,
        checkSubscription,
    };
}
