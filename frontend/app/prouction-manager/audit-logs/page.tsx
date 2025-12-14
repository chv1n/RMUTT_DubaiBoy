
"use client";

import { AuditLogList } from "@/components/audit-logs/audit-log-list";
import { useTranslation } from "@/components/providers/language-provider";

export default function AuditLogsPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{t("audit.title")}</h1>
                    <p className="text-gray-500">{t("audit.subtitle")}</p>
                </div>
            </div>
            <AuditLogList />
        </div>
    );
}
