"use client";

import React from "react";
import { MaterialForm } from "@/components/materials/material-form";
import { useTranslation } from "@/components/providers/language-provider";

export default function NewMaterialPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("materials.addMaterial")}</h1>
            <MaterialForm mode="create" />
        </div>
    );
}
