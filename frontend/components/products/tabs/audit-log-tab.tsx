"use client";

import React, { useState, useEffect } from "react";
import { AuditLogEntry } from "@/types/product";
import { productService } from "@/services/product.service";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useTranslation } from "@/components/providers/language-provider";

interface AuditLogTabProps {
    productId: string;
}

export function AuditLogTab({ productId }: AuditLogTabProps) {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await productService.getAuditLog(productId);
            setLogs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-content1 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold">{t("products.auditLog")}</h3>
            </div>

            <Table aria-label="Audit Log Table">
                <TableHeader>
                    <TableColumn>{t("common.date") || "Date"}</TableColumn>
                    <TableColumn>{t("common.user") || "User"}</TableColumn>
                    <TableColumn>{t("common.action") || "Action"}</TableColumn>
                    <TableColumn>{t("common.details") || "Details"}</TableColumn>
                </TableHeader>
                <TableBody items={logs} emptyContent="No logs found">
                    {(item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.timestamp}</TableCell>
                            <TableCell>{item.user}</TableCell>
                            <TableCell>{item.action}</TableCell>
                            <TableCell>{item.details}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
