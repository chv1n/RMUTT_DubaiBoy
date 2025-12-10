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
import { MoreVertical, Edit, Ban, UserCheck, Trash2, RotateCcw } from "lucide-react";
import { User } from "@/types/user";
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
    const { t } = useTranslation();

    const pages = Math.ceil(total / limit) || 1;

    const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
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
                return (
                    <div className="flex flex-col gap-1">
                        <UserRoleBadge role={user.role} />
                        <span className="text-tiny text-default-400">{user.department}</span>
                    </div>
                );
            case "is_active":
                return <UserStatusBadge isActive={user.is_active} />;
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
                                <DropdownItem key="edit" startContent={<Edit size={16} />}>{t('users.editUser')}</DropdownItem>
                                {user.is_active ? (
                                    <DropdownItem key="disable" startContent={<Ban size={16} />} className="text-warning" color="warning">{t('users.inactive')}</DropdownItem>
                                ) : (
                                    <DropdownItem key="enable" startContent={<UserCheck size={16} />} className="text-success" color="success">{t('users.active')}</DropdownItem>
                                )}
                                <DropdownItem key="delete" startContent={<Trash2 size={16} />} className="text-danger" color="danger">{t('users.delete')}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (user as any)[String(columnKey)];
        }
    }, [onAction, t]);

    const columns = [
        { name: t('users.fullname'), uid: "user", sortable: true },
        { name: t('users.role'), uid: "role", sortable: false }, // Role sorting logic in mock might be tricky if not enabled, but enabled in spec sort_field
        { name: t('users.status'), uid: "is_active", sortable: true },
        { name: t('users.lastLogin'), uid: "last_login", sortable: true },
        { name: t('common.date'), uid: "created_at", sortable: true },
        { name: t('common.actions'), uid: "actions" },
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
                onSelectionChange={onSelectionChange}
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
