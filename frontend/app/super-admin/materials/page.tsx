"use client";

import React from "react";
import { MaterialDashboard } from "@/components/materials/material-dashboard";
import { useTranslation } from "@/components/providers/language-provider";

export default function MaterialsPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            {/* <h1 className="text-2xl font-bold">{t("materials.title")}</h1> */}
            <MaterialDashboard />
        </div>
    );
}
