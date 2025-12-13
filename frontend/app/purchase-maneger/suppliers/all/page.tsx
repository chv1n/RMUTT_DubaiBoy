"use client";

import React from "react";
import { SupplierList } from "@/components/suppliers/supplier-list";
import { useTranslation } from "@/components/providers/language-provider";

export default function SuppliersAllPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("suppliers.list")}</h1>
            <SupplierList />
        </div>
    );
}
