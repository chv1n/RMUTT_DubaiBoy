"use client";

import React, { useEffect, useState, useCallback } from "react";
import { User, UserFilter, CreateUserPayload, UpdateUserPayload } from "@/types/user";
import { userService } from "@/services/user.service";
import { UserTable } from "./user-table";
import { UserForm } from "./user-form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

import { Plus, Search, Filter, RefreshCcw, Download } from "lucide-react";
import { useTranslation } from "react-i18next";


// I will check @heroui/toast usage. 
// Actually package.json has "@heroui/toast": "2.0.17". 
// Usage: import {addToast} from "@heroui/toast"? NextUI (HeroUI predecessor) usually uses standard libraries.
// I'll stick to a generic toast function using console for now if I don't see existing toast usage.
// Actually I see `sonner` is not in package.json.
// I'll use `addToast` from generic provider if present.
// For now, I'll mock toast.

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    // Basic fallback
    console.log(`[${type.toUpperCase()}] ${msg}`);
    // If there is a global toast method, insert it here.
    // window.alert(msg); // Too intrusive
};

export const UsersManagement = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState<UserFilter>({ page: 1, limit: 10 });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await userService.listUsers(filter);
            setUsers(res.data);
            setTotal(res.meta.total);
        } catch (error) {
            console.error(error);
            showToast("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSearch = (value: string) => {
        setFilter(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilter(prev => ({ ...prev, page }));
    };

    const handleSortChange = (descriptor: any) => {
        setFilter(prev => ({
            ...prev,
            sort_by: String(descriptor.column),
            sort_desc: descriptor.direction === 'descending'
        }));
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
        setActionLoading(true);
        try {
            if (selectedUser) {
                await userService.updateUser(selectedUser.id, data as UpdateUserPayload);
                showToast(t('user.messages.updated'));
            } else {
                await userService.createUser(data as CreateUserPayload);
                showToast(t('user.messages.created'));
            }
            setIsFormOpen(false);
            loadUsers();
        } catch (error) {
            console.error(error);
            showToast("Operation failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAction = async (key: string, user: User) => {
        switch (key) {
            case 'edit':
                handleEdit(user);
                break;
            case 'delete':
                if (confirm(t('common.confirmDeleteMessage'))) {
                    await userService.deleteUser(user.id);
                    showToast(t('user.messages.deleted'));
                    loadUsers();
                }
                break;
            case 'enable':
                await userService.enableUser(user.id);
                loadUsers();
                break;
            case 'disable':
                await userService.disableUser(user.id);
                loadUsers();
                break;
            case 'reset-password':
                await userService.resetPassword(user.id);
                showToast(t('user.messages.reset'));
                break;
            case 'view':
                window.location.href = `/super-admin/users/${user.id}`; // Simple native navigation or use router
                break;
        }
    };

    return (
        <div className="p-6 h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('user.title')}</h1>
                <div className="flex gap-2">
                    <Button color="primary" startContent={<Plus size={16} />} onPress={handleCreate}>
                        {t('user.create')}
                    </Button>
                    <Button variant="flat" startContent={<Download size={16} />} onPress={() => userService.exportUsers(filter)}>
                        {t('common.export')}
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-content1 p-4 rounded-lg shadow-sm">
                <Input
                    placeholder={t('user.field.username') + " / " + t('user.field.email')}
                    startContent={<Search size={16} className="text-default-400" />}
                    className="max-w-xs"
                    onValueChange={handleSearch}
                    isClearable
                />
                <div className="flex gap-2">
                    <Button isIconOnly variant="light" onPress={loadUsers}>
                        <RefreshCcw size={16} />
                    </Button>
                    {/* Add more filters here */}
                </div>
            </div>

            <UserTable
                users={users}
                isLoading={loading}
                total={total}
                page={filter.page || 1}
                limit={filter.limit || 10}
                sortDescriptor={filter.sort_by ? { column: filter.sort_by, direction: filter.sort_desc ? 'descending' : 'ascending' } : undefined}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onSelectionChange={() => { }}
                onAction={handleAction}
            />

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{selectedUser ? t('user.edit') : t('user.create')}</ModalHeader>
                            <ModalBody className="pb-6">
                                <UserForm
                                    initialData={selectedUser}
                                    onSubmit={handleSubmit}
                                    onCancel={onClose}
                                    isLoading={actionLoading}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};
