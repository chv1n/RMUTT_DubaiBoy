"use client";

import React from "react";
import { MaterialList } from "@/components/materials/material-list";
import { useTranslation } from "@/components/providers/language-provider";

export default function MaterialsAllPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("materials.list")}</h1>
            <MaterialList />
        </div>
    );
}
