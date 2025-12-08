"use client";

import React from "react";
import { SupplierDashboard } from "@/components/suppliers/supplier-dashboard";
import { useTranslation } from "@/components/providers/language-provider";

export default function SuppliersPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("suppliers.title")}</h1>
            <SupplierDashboard />
        </div>
    );
}
