"use client";

import React from "react";
import { ProductList } from "@/components/products/product-list";
import { useTranslation } from "@/components/providers/language-provider";

export default function ProductsPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t("products.title")}</h1>
            <ProductList />
        </div>
    );
}
