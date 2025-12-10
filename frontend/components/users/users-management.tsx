"use client";

import React, { useEffect, useState, useCallback } from "react";
import { User, CreateUserPayload, UpdateUserPayload } from "@/types/user";
import { userService } from "@/services/user.service";
import { UserForm } from "./user-form";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Edit, Trash2, RotateCcw } from "lucide-react"; // Icons
import { useTranslation } from "react-i18next";
import { DataTable, Column } from "@/components/common/data-table";
import { Meta } from "@/types/api";
import { UserStatusBadge, UserRoleBadge } from "./user-badges";
import { User as HeroUser } from "@heroui/user";
import { User2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export const UsersManagement = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1
    });

    // Filter states
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null); // null = all

    // Form/Modal states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await userService.getAll(
                page,
                rowsPerPage,
                search,
                isActiveFilter
            );
            setUsers(res.data);
            setMeta(res.meta);
        } catch (error) {
            console.error(error);
            addToast({ title: "Failed to load users", color: "danger" });
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, search, isActiveFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Handlers
    const handleCreate = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleViewProfile = (id: string | number) => {
        router.push(`/super-admin/users/${id}`);
    };

    const handleDelete = async (id: number | string) => {
        if (confirm(t('common.confirmDeleteMessage'))) {
            try {
                await userService.delete(id);
                addToast({ title: t('users.messages.deleted'), color: "success" });
                loadUsers();
            } catch (e) {
                addToast({ title: "Failed to delete", color: "danger" });
            }
        }
    };

    const handleRestore = async (id: number | string) => {
        try {
            await userService.restore(id);
            addToast({ title: t('users.messages.restored'), color: "success" });
            loadUsers();
        } catch (e) {
            addToast({ title: "Failed to restore", color: "danger" });
        }
    };

    const handleSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
        setActionLoading(true);
        try {
            if (selectedUser) {
                await userService.update(selectedUser.id, data as UpdateUserPayload);
                addToast({ title: t('users.messages.updated'), color: "success" });
            } else {
                await userService.create(data as CreateUserPayload);
                addToast({ title: t('users.messages.created'), color: "success" });
            }
            setIsFormOpen(false);
            loadUsers();
        } catch (error) {
            console.error(error);
            addToast({ title: "Operation failed", color: "danger" });
        } finally {
            setActionLoading(false);
        }
    };

    // Columns config
    const columns: Column[] = [
        { name: t('users.fullname'), uid: "user", sortable: true },
        { name: t('users.role'), uid: "role", sortable: true },
        { name: t('users.status'), uid: "status", sortable: true },
        { name: t('users.lastLogin'), uid: "last_login", sortable: true },
        { name: t('common.actions'), uid: "actions", align: "center" },
    ];

    const renderCell = useCallback((user: User, columnKey: React.Key) => {
        switch (columnKey) {
            case "user":
                return (
                    <HeroUser
                        avatarProps={{ radius: "lg", src: user.avatar_url }}
                        description={user.email}
                        name={user.fullname}
                    >
                        {user.email}
                    </HeroUser>
                );
            case "role":
                return <UserRoleBadge role={user.role} />;
            case "status":
                return <UserStatusBadge isActive={user.is_active} />;
            case "last_login":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}</span>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("common.view") || "View Profile"}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleViewProfile(user.id)}>
                                <Eye size={20} />
                            </span>
                        </Tooltip>
                        <Tooltip content={t("users.editUser")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(user)}>
                                <Edit size={20} />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content={t("users.delete")}>
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(user.id)}>
                                <Trash2 size={20} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return (user as any)[String(columnKey)];
        }
    }, [t]);

    return (
        <div className="p-6 h-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary w-fit">
                    {t('users.title')}
                </h1>
                <p className="text-default-500 text-small">Manage system access and permissions</p>
            </div>

            <DataTable
                data={users}
                columns={columns}
                meta={meta}
                isLoading={loading}
                onPageChange={setPage}
                onRowsPerPageChange={(rows) => {
                    setRowsPerPage(rows);
                    setPage(1);
                }}
                onSearch={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                onFilterStatus={(status) => {
                    // status is string "true", "false", "all"
                    if (status === "all") setIsActiveFilter(null);
                    else setIsActiveFilter(status === "true");
                    setPage(1);
                }}
                statusOptions={[
                    { name: t("users.active"), uid: "true" },
                    { name: t("users.inactive"), uid: "false" }
                ]}
                onAddNew={handleCreate}
                onExportExcel={() => userService.export({ ...meta, exportType: 'excel' })}
                renderCell={renderCell}
            />

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                size="2xl"
                backdrop="blur"
                classNames={{
                    base: "border-default-100 shadow-xl",
                    header: "border-b border-default-100",
                    footer: "border-t border-default-100",
                    closeButton: "hover:bg-default-100 transition-colors"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {selectedUser ? t('users.editUser') : t('users.addUser')}
                                <span className="text-small font-normal text-default-500">
                                    {selectedUser ? "Update user details" : "Create new user"}
                                </span>
                            </ModalHeader>
                            <ModalBody className="py-6 px-1">
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
