
"use client";

import React from "react";
import { InventoryTransactionList } from "@/components/inventory/inventory-transaction-list";
import { useTranslation } from "react-i18next";

export default function InventoryTransactionsPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('inventory.transactions')}</h1>
            </div>
            <InventoryTransactionList />
        </div>
    );
}
