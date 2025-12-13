"use client";

import React from "react";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { useTranslation } from "@/components/providers/language-provider";

export default function NewSupplierPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("suppliers.addSupplier")}</h1>
            <SupplierForm mode="create" />
        </div>
    );
}
