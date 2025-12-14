
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Eye } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { auditLogService, AuditLog, AuditAction, AuditEntity } from "@/services/audit-log.service";
import { Meta } from "@/types/api";
import { DataTable, Column } from "@/components/common/data-table";
import { AuditLogDetailModal } from "./audit-log-detail-modal";
import { exportToExcel, exportToCSV } from "@/lib/utils/export";

export function AuditLogList() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 20,
        totalPages: 0,
        currentPage: 1
    });

    // Filter states
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [search, setSearch] = useState("");

    // New Filters
    const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
    const [userId, setUserId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Modal state
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await auditLogService.getAll({
                page,
                limit: rowsPerPage,
                action: (selectedAction && selectedAction !== 'all') ? selectedAction as AuditAction : undefined,
                entity_id: search || undefined,
                entity_type: (selectedEntityType && selectedEntityType !== 'all') ? selectedEntityType as AuditEntity : undefined,
                user_id: userId ? parseInt(userId) : undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined
            });

            if (response.success && response.data) {
                setLogs(response.data);
                if (response.meta) setMeta(response.meta);
            }
        } catch (error) {
            console.error("Failed to load audit logs", error);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, selectedAction, search, selectedEntityType, userId, startDate, endDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleResetFilters = () => {
        setSelectedEntityType("all");
        setUserId("");
        setStartDate("");
        setEndDate("");
        setSearch("");
        setSelectedAction("");
        setPage(1);
    };

    const handleViewDetail = (log: AuditLog) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const handleExportExcel = () => {
        const dataToExport = logs.map(log => ({
            ID: log.id,
            User: log.username,
            Action: log.action,
            Entity: log.entity_type,
            "Entity ID": log.entity_id,
            Date: new Date(log.created_at).toLocaleString(),
        }));
        exportToExcel(dataToExport, "AuditLogs");
    };

    const handleExportCSV = () => {
        const dataToExport = logs.map(log => ({
            ID: log.id,
            User: log.username,
            Action: log.action,
            Entity: log.entity_type,
            "Entity ID": log.entity_id,
            Date: new Date(log.created_at).toLocaleString(),
        }));
        exportToCSV(dataToExport, "AuditLogs");
    };

    const columns: Column[] = [
        { name: "ID", uid: "id", sortable: true },
        { name: t("users.user"), uid: "username" },
        { name: t("users.audit.action"), uid: "action" },
        { name: "Entity", uid: "entity" },
        { name: t("users.audit.date"), uid: "created_at", sortable: true },
        { name: t("common.actions"), uid: "actions", align: "center" },
    ];

    const getActionColor = (action: AuditAction) => {
        switch (action) {
            case AuditAction.CREATE: return "success";
            case AuditAction.UPDATE: return "warning";
            case AuditAction.DELETE: return "danger";
            case AuditAction.LOGIN_SUCCESS: return "primary";
            case AuditAction.LOGIN_FAILED: return "danger";
            default: return "default";
        }
    };

    const renderCell = useCallback((log: AuditLog, columnKey: React.Key) => {
        switch (columnKey) {
            case "id":
                return <span className="text-default-400">#{log.id}</span>;
            case "username":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{log.username}</p>
                        <p className="text-tiny text-default-400">ID: {log.user_id}</p>
                    </div>
                );
            case "action":
                return (
                    <Chip color={getActionColor(log.action)} size="sm" variant="flat">
                        {log.action}
                    </Chip>
                );
            case "entity":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{log.entity_type}</p>
                        <p className="text-tiny text-default-400">ID: {log.entity_id}</p>
                    </div>
                );
            case "created_at":
                return (
                    <span className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                    </span>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("users.audit.details")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleViewDetail(log)}>
                                <Eye size={20} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    }, [t]);

    const actionOptions = Object.values(AuditAction).map(action => ({
        name: action,
        uid: action
    }));

    return (
        <div className="space-y-4">
            {/* Extended Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-default-50 p-4 rounded-xl border border-default-200">
                <Select
                    label="Entity Type"
                    placeholder="All Entities"
                    selectedKeys={selectedEntityType !== "all" ? [selectedEntityType] : []}
                    onChange={(e) => {
                        setSelectedEntityType(e.target.value || "all");
                        setPage(1);
                    }}
                    size="sm"
                    className="w-full"
                >
                    {[
                        { value: "all", label: "All Entities" },
                        ...Object.values(AuditEntity).map(e => ({ value: e, label: e }))
                    ].map((type) => (
                        <SelectItem key={type.value}>
                            {type.label}
                        </SelectItem>
                    ))}
                </Select>

                <Input
                    type="number"
                    label="User ID"
                    placeholder="Filter by User ID"
                    value={userId}
                    onValueChange={(val) => {
                        setUserId(val);
                        setPage(1);
                    }}
                    size="sm"
                />

                <Input
                    type="date"
                    label="Start Date"
                    placeholder="Start Date"
                    value={startDate}
                    onValueChange={(val) => {
                        setStartDate(val);
                        setPage(1);
                    }}
                    size="sm"
                />

                <Input
                    type="date"
                    label="End Date"
                    placeholder="End Date"
                    value={endDate}
                    onValueChange={(val) => {
                        setEndDate(val);
                        setPage(1);
                    }}
                    size="sm"
                />

                <Button
                    color="default"
                    variant="flat"
                    onPress={handleResetFilters}
                    className="h-full"
                >
                    Reset Filters
                </Button>
            </div>

            <DataTable
                data={logs}
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
                onFilterStatus={(val) => {
                    setSelectedAction(val);
                    setPage(1);
                }}
                statusLabel={t("users.audit.action")}
                statusOptions={actionOptions}
                onExportExcel={handleExportExcel}
                onExportCSV={handleExportCSV}
                renderCell={renderCell}
            />

            <AuditLogDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
}
