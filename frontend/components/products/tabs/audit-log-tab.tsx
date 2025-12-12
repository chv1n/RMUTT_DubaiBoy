"use client";

import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useTranslation } from "@/components/providers/language-provider";
import { auditLogService, AuditEntity, AuditLog, AuditAction } from "@/services/audit-log.service";
import { Chip, ChipProps } from "@heroui/chip";
import { User } from "@heroui/user";
import { Button } from "@heroui/button";
import { Eye } from "lucide-react";
import { AuditLogDetailModal } from "@/components/audit-logs/audit-log-detail-modal";
import { Pagination } from "@heroui/pagination";

interface AuditLogTabProps {
    productId: string;
}

const statusColorMap: Record<string, ChipProps["color"]> = {
    [AuditAction.CREATE]: "success",
    [AuditAction.UPDATE]: "primary",
    [AuditAction.DELETE]: "danger",
    [AuditAction.RESTORE]: "warning",
    [AuditAction.LOGIN_SUCCESS]: "success",
    [AuditAction.LOGIN_FAILED]: "danger",
    [AuditAction.LOGOUT]: "default",
    [AuditAction.PASSWORD_CHANGE]: "secondary",
};

export function AuditLogTab({ productId }: AuditLogTabProps) {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId, page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await auditLogService.getAll({
                page: page,
                limit: 10,
                entity_type: AuditEntity.Product,
                entity_id: productId,
                sort_order: 'DESC'
            });

            if (response.success && response.data) {
                setLogs(response.data);
                if (response.meta) {
                    setTotalPages(response.meta.totalPages);
                }
            }
        } catch (e) {
            console.error("Failed to load audit logs", e);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-content1 p-4 rounded-xl shadow-sm border border-default-200">
                <div>
                    <h3 className="text-lg font-bold">{t("products.auditLog")}</h3>
                    <p className="text-small text-default-500">History of changes for this product</p>
                </div>
            </div>

            <Table
                aria-label="Audit Log Table"
                bottomContent={
                    totalPages > 1 ? (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={totalPages}
                                onChange={(page) => setPage(page)}
                            />
                        </div>
                    ) : null
                }
            >
                <TableHeader>
                    <TableColumn>{t("users.audit.date") || "Date"}</TableColumn>
                    <TableColumn>{t("users.user") || "User"}</TableColumn>
                    <TableColumn>{t("users.audit.action") || "Action"}</TableColumn>
                    <TableColumn align="center">{t("common.details") || "Details"}</TableColumn>
                </TableHeader>
                <TableBody items={logs} emptyContent={loading ? "Loading..." : t("common.noData") || "No logs found"} isLoading={loading}>
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-small font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className="text-tiny text-default-400">{new Date(item.created_at).toLocaleTimeString()}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <User
                                    name={item.username}
                                    description={t("users.role.user")}
                                    avatarProps={{
                                        radius: "lg",
                                        src: `https://i.pravatar.cc/150?u=${item.user_id}`
                                    }}
                                >
                                    {item.username}
                                </User>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    className="capitalize"
                                    color={statusColorMap[item.action] || "default"}
                                    size="sm"
                                    variant="flat"
                                >
                                    {item.action.replace('_', ' ').toLowerCase()}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => handleViewDetails(item)}
                                        className="text-default-400 hover:text-primary transition-colors"
                                    >
                                        <Eye size={20} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <AuditLogDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
}
