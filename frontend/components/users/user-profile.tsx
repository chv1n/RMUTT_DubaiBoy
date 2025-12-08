"use client";

import React, { useEffect, useState } from "react";
import { User, UserActivity, UserSession } from "@/types/user";
import { userService } from "@/services/user.service";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { useTranslation } from "react-i18next";
import { User as HeroUser } from "@heroui/user";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import { Edit, Ban, Key, Activity, Shield, Info, Smartphone, Monitor } from "lucide-react";
import { UserStatusBadge, UserRoleBadge } from "./user-badges";
import { UserForm } from "./user-form";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

interface UserProfileProps {
    userId: string;
}

export const UserProfile = ({ userId }: UserProfileProps) => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState<User | null>(null);
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [userData, activityData, sessionData] = await Promise.all([
                userService.getUser(userId),
                userService.getUserActivity(userId),
                userService.getUserSessions(userId)
            ]);
            setUser(userData);
            setActivities(activityData);
            setSessions(sessionData);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [userId]);

    const handleEditSuccess = async (data: any) => { // Type relaxed for simplicity
        if (user) {
            await userService.updateUser(user.id, data);
            setIsEditOpen(false);
            loadData();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
                <Skeleton className="rounded-lg h-40" />
                <Skeleton className="rounded-lg h-96" />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center">User not found</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto">
            {/* Header Card */}
            <Card className="w-full">
                <CardBody className="flex flex-row gap-6 items-center p-6 flex-wrap">
                    <HeroUser
                        name={""}
                        description={""}
                        avatarProps={{
                            src: user.avatar_url,
                            className: "w-24 h-24 text-large"
                        }}
                    />
                    <div className="flex flex-col gap-2 flex-grow">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {user.display_name?.[i18n.language as 'en' | 'th' | 'ja'] || user.username}
                                </h1>
                                <p className="text-default-500">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <UserStatusBadge status={user.status} />
                                    {user.roles.map(r => <UserRoleBadge key={r} role={r} />)}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button startContent={<Edit size={16} />} onPress={() => setIsEditOpen(true)}>
                                    {t('user.edit')}
                                </Button>
                                <Button isIconOnly variant="flat" color="warning">
                                    <Key size={16} />
                                </Button>
                                <Button isIconOnly variant="flat" color="danger">
                                    <Ban size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Tabs content */}
            <Tabs aria-label="User Profile Sections" color="primary" variant="underlined">
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center space-x-2">
                            <Info size={16} />
                            <span>{t('user.profile.overview')}</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{t('user.profile.details')}</h3>
                                <div className="space-y-4">
                                    <DetailItem label={t('user.field.username')} value={user.username} />
                                    <DetailItem label={t('user.field.email')} value={user.email} />
                                    <DetailItem label={t('user.field.phone')} value={user.phone || '-'} />
                                    <DetailItem label={t('user.field.department')} value={user.department} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{t('common.settings')}</h3>
                                <div className="space-y-4">
                                    <DetailItem label={t('user.field.locale')} value={user.locale || 'en'} />
                                    <DetailItem label={t('user.field.timezone')} value={user.timezone || 'Asia/Bangkok'} />
                                    <DetailItem label={t('user.field.createdAt')} value={new Date(user.created_at).toLocaleDateString()} />
                                    <DetailItem label={t('user.field.lastLogin')} value={user.last_login ? new Date(user.last_login).toLocaleString() : '-'} />
                                </div>
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">{t('user.profile.bio')}</h4>
                                    <p className="text-default-500 text-sm whitespace-pre-wrap border p-3 rounded-lg bg-default-50">
                                        {user.notes || "No notes available."}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab
                    key="security"
                    title={
                        <div className="flex items-center space-x-2">
                            <Shield size={16} />
                            <span>{t('user.profile.security')}</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold mb-4">{t('user.profile.sessions')}</h3>
                            <div className="flex flex-col gap-4">
                                {sessions.map(session => (
                                    <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-primary-50 rounded-full text-primary">
                                                {session.device.toLowerCase().includes('mobile') ? <Smartphone /> : <Monitor />}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {session.device} - {session.browser}
                                                    {session.is_current && <Chip size="sm" color="success" className="ml-2" variant="flat">Current</Chip>}
                                                </p>
                                                <p className="text-tiny text-default-400">
                                                    {session.ip_address} • Last active: {new Date(session.last_active).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {!session.is_current && (
                                            <Button size="sm" variant="light" color="danger">Revoke</Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab
                    key="activity"
                    title={
                        <div className="flex items-center space-x-2">
                            <Activity size={16} />
                            <span>{t('user.profile.activity')}</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold mb-4">{t('user.profile.timeline')}</h3>
                            <div className="flex flex-col gap-6 pl-2"> // Simple timeline
                                {activities.map((act, idx) => (
                                    <div key={act.id} className="relative flex gap-4">
                                        {/* Line */}
                                        {idx !== activities.length - 1 && (
                                            <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-default-200" />
                                        )}
                                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary">
                                            <Activity size={18} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-small font-medium">{act.action.replace('_', ' ').toUpperCase()}</span>
                                            <span className="text-tiny text-default-400">{new Date(act.timestamp).toLocaleString()}</span>
                                            <p className="text-small text-default-500">{act.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>

            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{t('user.edit')}</ModalHeader>
                            <ModalBody className="pb-6">
                                <UserForm
                                    initialData={user}
                                    onSubmit={handleEditSuccess}
                                    onCancel={onClose}
                                    isLoading={false}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col">
        <span className="text-tiny text-default-400 uppercase tracking-wider">{label}</span>
        <span className="text-medium">{value}</span>
    </div>
);
