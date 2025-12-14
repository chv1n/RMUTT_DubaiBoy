"use client";

import React from "react";
import { ContainerTypeManagement } from "@/components/materials/container-type-management";
import { useTranslation } from "@/components/providers/language-provider";

export default function ContainerTypesPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("containers.title")}</h1>
            <ContainerTypeManagement />
        </div>
    );
}
