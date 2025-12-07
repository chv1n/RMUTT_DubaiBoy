"use client";

import React from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    SortDescriptor,
    Selection,
} from "@heroui/table";
import { User as HeroUser } from "@heroui/user";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import { MoreVertical, Eye, Edit, Key, Ban, UserCheck, Trash2 } from "lucide-react";
import { User, UserRole, UserStatus } from "@/types/user";
import { UserStatusBadge, UserRoleBadge } from "./user-badges";
import { useTranslation } from "react-i18next";

interface UserTableProps {
    users: User[];
    isLoading: boolean;
    total: number;
    page: number;
    limit: number;
    sortDescriptor?: SortDescriptor;
    onSortChange: (descriptor: SortDescriptor) => void;
    onPageChange: (page: number) => void;
    onSelectionChange: (keys: Selection) => void;
    onAction: (action: string, user: User) => void;
}

export const UserTable = ({
    users,
    isLoading,
    total,
    page,
    limit,
    sortDescriptor,
    onSortChange,
    onPageChange,
    onSelectionChange,
    onAction,
}: UserTableProps) => {
    const { t, i18n } = useTranslation();

    const pages = Math.ceil(total / limit);

    const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
        switch (columnKey) {
            case "user":
                return (
                    <HeroUser
                        avatarProps={{ radius: "lg", src: user.avatar_url }}
                        description={user.email}
                        name={user.display_name?.[i18n.language as 'en' | 'th' | 'ja'] || user.username}
                    >
                        {user.email}
                    </HeroUser>
                );
            case "roles":
                return (
                    <div className="flex flex-col gap-1">
                        {user.roles.map(r => <UserRoleBadge key={r} role={r} />)}
                        <span className="text-tiny text-default-400">{user.department}</span>
                    </div>
                );
            case "status":
                return <UserStatusBadge status={user.status} />;
            case "last_login":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}</span>
                        <span className="text-tiny text-default-400">{user.last_login ? new Date(user.last_login).toLocaleTimeString() : ''}</span>
                    </div>
                );
            case "created_at":
                return (
                    <span className="text-small">{new Date(user.created_at).toLocaleDateString()}</span>
                );
            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <MoreVertical className="text-default-300" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="User Actions" onAction={(key) => onAction(key as string, user)}>
                                <DropdownItem key="view" startContent={<Eye size={16} />}>{t('user.actions.viewProfile')}</DropdownItem>
                                <DropdownItem key="edit" startContent={<Edit size={16} />}>{t('user.actions.edit')}</DropdownItem>
                                <DropdownItem key="reset-password" startContent={<Key size={16} />}>{t('user.actions.resetPassword')}</DropdownItem>
                                {user.status === 'active' ? (
                                    <DropdownItem key="disable" startContent={<Ban size={16} />} className="text-danger" color="danger">{t('user.actions.disable')}</DropdownItem>
                                ) : (
                                    <DropdownItem key="enable" startContent={<UserCheck size={16} />} className="text-success" color="success">{t('user.actions.enable')}</DropdownItem>
                                )}
                                <DropdownItem key="delete" startContent={<Trash2 size={16} />} className="text-danger" color="danger">{t('user.actions.delete')}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                return (user as any)[String(columnKey)];
        }
    }, [onAction, i18n.language, t]);

    const columns = [
        { name: t('user.field.fullname'), uid: "user", sortable: true },
        { name: t('user.field.roles'), uid: "roles", sortable: false },
        { name: t('user.field.status'), uid: "status", sortable: true },
        { name: t('user.field.lastLogin'), uid: "last_login", sortable: true },
        { name: t('user.field.createdAt'), uid: "created_at", sortable: true },
        { name: t('user.loading'), uid: "actions" },
    ];

    return (
        <div className="flex flex-col gap-4">
            <Table
                aria-label="Users Table"
                isHeaderSticky
                bottomContent={
                    pages > 0 ? (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={pages}
                                onChange={onPageChange}
                            />
                        </div>
                    ) : null
                }
                sortDescriptor={sortDescriptor}
                onSortChange={onSortChange}
                selectionMode="multiple"
                onSelectionChange={onSelectionChange} // Handle bulk selection state
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    items={users}
                    emptyContent={"No users found"}
                    isLoading={isLoading}
                    loadingContent={<div>Loading...</div>}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
