'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { usePushNotification } from '@/hooks/usePushNotification';
import { Bell, X } from 'lucide-react';

interface NotificationPermissionBannerProps {
    token: string;
    onSubscribed?: () => void;
}

export function NotificationPermissionBanner({ token, onSubscribed }: NotificationPermissionBannerProps) {
    const [dismissed, setDismissed] = useState(false);
    const { isSupported, permission, isSubscribed, isLoading, error, subscribe } = usePushNotification();

    // Don't show if not supported, already subscribed, or dismissed
    if (!isSupported || isSubscribed || dismissed || permission === 'denied') {
        return null;
    }

    const handleSubscribe = async () => {
        const success = await subscribe(token);
        if (success && onSubscribed) {
            onSubscribed();
        }
    };

    return (
        <Card className="mb-4 border-primary/20 bg-primary/5">
            <CardBody className="flex flex-row items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">เปิดรับการแจ้งเตือน</p>
                        <p className="text-sm text-default-500">
                            รับแจ้งเตือนเมื่อมีวัตถุดิบใกล้หมด หรือการผลิตเสร็จสิ้น
                        </p>
                        {error && <p className="text-sm text-danger">{error}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        color="primary"
                        size="sm"
                        isLoading={isLoading}
                        onPress={handleSubscribe}
                    >
                        อนุญาต
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        isIconOnly
                        onPress={() => setDismissed(true)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}
