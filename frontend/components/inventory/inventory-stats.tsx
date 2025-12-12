
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card"; // Assuming Card is available in HeroUI or similar
import { inventoryService } from "@/services/inventory.service";
import { useTranslation } from "react-i18next";
import { TrendingUp, AlertTriangle, Package, Archive } from "lucide-react";

export const InventoryStats = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalStock: 0,
        lowStockCount: 0,
        totalMaterials: 0,
        totalWarehouses: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetching parallel for dashboard stats
                // In a real app, might reference a specific dashboard endpoint or aggregate
                // For now, let's use available endpoints to estimate
                const [balanceRes, lowStockRes, totalRes] = await Promise.all([
                    inventoryService.getBalance({}), // Just to get total count from meta
                    inventoryService.getLowStockAlerts({}),
                    inventoryService.getTotalBalance({})
                ]);

                setStats({
                    totalStock: totalRes.success ? totalRes.data.reduce((acc, item) => acc + item.total_quantity, 0) : 0, // This logic depends on paging, mostly illustrative for mock
                    lowStockCount: lowStockRes.success && lowStockRes.meta ? lowStockRes.meta.totalItems : 0,
                    totalMaterials: totalRes.success && totalRes.meta ? totalRes.meta.totalItems : 0,
                    totalWarehouses: 0 // Would need warehouse service for this, or just skip
                });

            } catch (error) {
                console.error("Failed to fetch inventory stats");
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <Card className="flex-1 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <CardBody className="flex flex-row items-center gap-4 p-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                <div>
                    <p className="text-small text-default-500 font-medium">{title}</p>
                    <h4 className="text-2xl font-bold">{value}</h4>
                </div>
            </CardBody>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
                title={t('inventory.fields.available')}
                value={stats.totalMaterials}
                icon={Package}
                color="bg-primary-500"
            />
            <StatCard
                title={t('inventory.lowStock')}
                value={stats.lowStockCount}
                icon={AlertTriangle}
                color="bg-danger-500"
            />
            <StatCard
                title={t('materials.totalMaterials')}
                value={stats.totalStock} // Using total quantity as proxy
                icon={TrendingUp}
                color="bg-success-500"
            />
            {/* Placeholder for broader Warehouse stat if needed */}
            <StatCard
                title={t('warehouses.title')}
                value="-"
                icon={Archive}
                color="bg-warning-500"
            />
        </div>
    );
};
