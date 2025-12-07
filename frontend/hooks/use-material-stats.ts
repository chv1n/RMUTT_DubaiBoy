import { useState, useEffect } from "react";
import { Material } from "@/types/materials";
import { materialService } from "@/services/material.service";
import { generateTrendData, calculateTrendPercentage } from "@/lib/utils/dashboard-helpers";

export interface DashboardStats {
    totalValue: { value: number; trend: number; data: any[] };
    lowStock: { value: number; trend: number; data: any[] };
    totalItems: { value: number; trend: number; data: any[] };
}

export function useMaterialStats() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalValue: { value: 0, trend: 0, data: [] },
        lowStock: { value: 0, trend: 0, data: [] },
        totalItems: { value: 0, trend: 0, data: [] }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await materialService.getAll(1, 2000);
            const data = response.data || [];
            setMaterials(data);
            calculateStats(data);
        } catch (error) {
            console.error("Failed to load materials", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Material[]) => {
        // 1. Total Value
        const totalValue = data.reduce((sum, m) => sum + (m.price * m.quantity), 0);
        const valueTrendData = generateTrendData(totalValue, 7, 0.05);
        
        // 2. Low Stock
        const lowStockCount = data.filter(m => m.quantity <= m.minStockLevel).length;
        const lowStockTrendData = generateTrendData(lowStockCount, 7, 0.1);

        // 3. Total Items
        const totalItems = data.length;
        const itemsTrendData = generateTrendData(totalItems, 7, 0.01);

        setStats({
            totalValue: {
                value: totalValue,
                trend: calculateTrendPercentage(valueTrendData),
                data: valueTrendData
            },
            lowStock: {
                value: lowStockCount,
                trend: calculateTrendPercentage(lowStockTrendData),
                data: lowStockTrendData
            },
            totalItems: {
                value: totalItems,
                trend: calculateTrendPercentage(itemsTrendData),
                data: itemsTrendData
            }
        });
    };

    return { materials, stats, loading, refresh: loadData };
}
