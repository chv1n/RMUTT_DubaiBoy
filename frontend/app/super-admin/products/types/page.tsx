"use client";

import React from "react";
import { ProductTypeManager } from "@/components/products/product-type-manager";
import { useTranslation } from "@/components/providers/language-provider";
export default function ProductTypesPage() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full w-full px-6 transition-all duration-300">
            <div className="flex flex-col gap-4 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t("common.productTypes")}</h1>
                        <p className="text-default-500">Manage your product categories and types</p>
                    </div>
                </div>
                <ProductTypeManager />
            </div>
        </div>
    );
}
