"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs"; // Keep in case needed later, or remove if strict cleanup. I will remove it.
// Actually, let's remove Tabs import if we delete usage.
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
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [userData] = await Promise.all([
                userService.getById(userId)
            ]);
            setUser(userData);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [userId]);

    const handleEditSuccess = async (data: any) => {
        if (user) {
            await userService.update(user.id, data);
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
                                    {user.fullname}
                                </h1>
                                <p className="text-default-500">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <UserStatusBadge isActive={user.is_active} />
                                    <UserRoleBadge role={user.role} />
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

            <Card className="w-full">
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Info size={20} />
                            {t('user.profile.details')}
                        </h3>
                        <div className="space-y-4">
                            <DetailItem label="ID" value={String(user.id)} />
                            <DetailItem label={t('user.field.username')} value={user.username} />
                            <DetailItem label={t('user.field.email')} value={user.email} />
                            <DetailItem label={t('user.field.fullname')} value={user.fullname} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield size={20} />
                            {t('common.settings')}
                        </h3>
                        <div className="space-y-4">
                            <DetailItem label={t('user.field.role')} value={user.role} />
                            <div className="flex flex-col">
                                <span className="text-tiny text-default-400 uppercase tracking-wider mb-1">{t('user.field.status')}</span>
                                <UserStatusBadge isActive={user.is_active} />
                            </div>
                            <DetailItem label={t('user.field.createdAt')} value={new Date(user.created_at).toLocaleDateString()} />
                            {/* <DetailItem label={t('user.field.deletedAt')} value={user.deleted_at ? new Date(user.deleted_at).toLocaleDateString() : '-'} /> */}
                        </div>
                    </div>
                </CardBody>
            </Card>

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

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="flex flex-col">
        <span className="text-tiny text-default-400 uppercase tracking-wider">{label}</span>
        <span className="text-medium">{value || '-'}</span>
    </div>
);
