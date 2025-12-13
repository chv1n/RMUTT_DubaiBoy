
"use client";

import React from "react";
import { InventoryBalanceList } from "@/components/inventory/inventory-balance-list";
import { useTranslation } from "react-i18next";

export default function InventoryBalancePage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('inventory.balance')}</h1>
            </div>
            <InventoryBalanceList />
        </div>
    );
}
