"use client";

import React from "react";
import { GroupManagement } from "@/components/materials/group-management";
import { useTranslation } from "@/components/providers/language-provider";

export default function MaterialGroupsPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("groups.title")}</h1>
            <GroupManagement />
        </div>
    );
}
