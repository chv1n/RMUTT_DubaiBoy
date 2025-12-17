import React from 'react';
import { Button } from '@heroui/button';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotification } from '@/hooks/usePushNotification';
import { Tooltip } from '@heroui/tooltip';

export const PushNotificationButton = () => {
    const { permission, subscription, subscribe, unsubscribe } = usePushNotification();

    const handleClick = () => {
        if (subscription) {
            unsubscribe();
        } else {
            subscribe();
        }
    };

    if (permission === 'denied') {
        return (
            <Tooltip content="Notifications are blocked">
                <Button isIconOnly variant="light" disabled>
                    <BellOff className="text-default-300" />
                </Button>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={subscription ? "Disable Notifications" : "Enable Notifications"}>
            <Button isIconOnly variant="light" onPress={handleClick}>
                {subscription ? <Bell className="text-primary" fill="currentColor" /> : <Bell className="text-default-500" />}
            </Button>
        </Tooltip>
    );
};
