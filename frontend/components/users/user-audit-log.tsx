"use client";

import React, { useState, useEffect } from "react";
import { userService } from "@/services/user.service";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Activity, Clock, Shield, Monitor, Smartphone, Globe } from "lucide-react";

interface UserAuditLogProps {
    userId: string | number;
}

interface AuditLogItem {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    ip_address?: string;
}

export function UserAuditLog({ userId }: UserAuditLogProps) {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            loadData();
        }
    }, [userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await userService.getUserActivity(userId);
            setLogs(data);
        } catch (e) {
            console.error("Failed to load audit logs", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <Skeleton className="rounded-full w-10 h-10" />
                        <div className="w-full flex flex-col gap-2">
                            <Skeleton className="h-4 w-3/4 rounded-lg" />
                            <Skeleton className="h-3 w-1/2 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-default-400">
                <Activity size={48} className="mb-4 opacity-50" />
                <p>{t("common.noData", "No activity logs found")}</p>
            </div>
        );
    }

    const getIcon = (action: string) => {
        if (action.includes("LOGIN")) return <Monitor size={18} />;
        if (action.includes("PROFILE")) return <Shield size={18} />;
        if (action.includes("PASSWORD")) return <Shield size={18} />;
        if (action.includes("LOGOUT")) return <Activity size={18} />;
        return <Activity size={18} />;
    };

    const getColor = (action: string) => {
        if (action.includes("LOGIN")) return "success";
        if (action.includes("LOGOUT")) return "warning";
        if (action.includes("DELETE")) return "danger";
        return "primary";
    };

    return (
        <div className="flex flex-col gap-6 p-2">
            <div className="relative border-l-2 border-default-200 ml-4 space-y-8">
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-8">
                        {/* Timeline Logic */}
                        <div className={`absolute -left-[9px] top-1 w-5 h-5 rounded-full bg-background border-2 border-${getColor(log.action)} flex items-center justify-center`}>
                            <div className={`w-2 h-2 rounded-full bg-${getColor(log.action)}`} />
                        </div>

                        <Card shadow="sm" className="w-full border-none bg-default-50 hover:bg-default-100 transition-colors">
                            <CardBody className="py-3 px-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-lg bg-${getColor(log.action)}/10 text-${getColor(log.action)} h-fit mt-1`}>
                                            {getIcon(log.action)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-medium">{log.action.replace(/_/g, " ")}</span>
                                            <span className="text-small text-default-500">{log.details}</span>
                                            {log.ip_address && (
                                                <div className="flex items-center gap-1 text-tiny text-default-400 mt-1">
                                                    <Globe size={12} />
                                                    <span>{log.ip_address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-tiny text-default-400 shrink-0">
                                        <Clock size={12} />
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
