'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover';
import { Badge } from '@heroui/badge';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Bell, BellOff, Settings } from 'lucide-react';
import { usePushNotification } from '@/hooks/usePushNotification';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: Date;
    read: boolean;
}

// No token prop needed - auth uses httpOnly cookies
export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { isSupported, isSubscribed, permission, subscribe, unsubscribe, isLoading } = usePushNotification();

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleToggleSubscription = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end">
            <PopoverTrigger>
                <Button variant="light" isIconOnly className="relative">
                    <Badge
                        content={unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined}
                        color="danger"
                        size="sm"
                        isInvisible={unreadCount === 0}
                    >
                        {isSubscribed ? (
                            <Bell className="h-5 w-5" />
                        ) : (
                            <BellOff className="h-5 w-5 text-default-400" />
                        )}
                    </Badge>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <Card className="border-none shadow-none">
                    <CardHeader className="flex justify-between items-center px-4 py-3">
                        <span className="font-semibold">การแจ้งเตือน</span>
                        <div className="flex gap-2">
                            {notifications.length > 0 && (
                                <Button size="sm" variant="light" onPress={markAllAsRead}>
                                    อ่านทั้งหมด
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-0 max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-default-400">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>ไม่มีการแจ้งเตือน</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 hover:bg-default-100 cursor-pointer ${!notification.read ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <p className="font-medium text-sm">{notification.title}</p>
                                        <p className="text-xs text-default-500 mt-1">
                                            {notification.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                    <Divider />
                    <div className="p-3">
                        {isSupported ? (
                            <Button
                                size="sm"
                                variant="flat"
                                color={isSubscribed ? 'danger' : 'primary'}
                                className="w-full"
                                isLoading={isLoading}
                                startContent={isSubscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                                onPress={handleToggleSubscription}
                                isDisabled={permission === 'denied'}
                            >
                                {isSubscribed ? 'ปิดการแจ้งเตือน' : 'เปิดการแจ้งเตือน'}
                            </Button>
                        ) : (
                            <p className="text-xs text-center text-default-400">
                                เบราว์เซอร์ไม่รองรับการแจ้งเตือน
                            </p>
                        )}
                        {permission === 'denied' && (
                            <p className="text-xs text-center text-warning mt-2">
                                คุณได้ปิดกั้นการแจ้งเตือน กรุณาเปิดในการตั้งค่าเบราว์เซอร์
                            </p>
                        )}
                    </div>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
