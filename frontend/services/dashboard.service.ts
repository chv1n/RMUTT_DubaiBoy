
import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types/api';
import { SmartFactoryStats, LowStockMaterial, SmartAlert, SmartChartData, PlanAtRisk, DashboardOverview } from '@/types/dashboard';

// Mock Data (Fallback)
const MOCK_STATS: SmartFactoryStats = {
    total_materials: 1250,
    low_stock_materials: 45,
    critical_alerts: 12,
    total_stock_value: 4500000.00,
    active_production_plans: 8
};

const MOCK_LOW_STOCK: LowStockMaterial[] = [
    { material_id: 101, material_name: "Screw 5mm", warehouse: "Main WH", current_qty: 50, reorder_point: 100, shortage_qty: 50, unit: "pcs", status: "CRITICAL" },
    { material_id: 102, material_name: "Aluminum Rod 10mm", warehouse: "Main WH", current_qty: 200, reorder_point: 500, shortage_qty: 300, unit: "kg", status: "WARNING" },
    { material_id: 103, material_name: "Paint Red", warehouse: "Chem WH", current_qty: 5, reorder_point: 20, shortage_qty: 15, unit: "liters", status: "CRITICAL" },
    { material_id: 104, material_name: "Plastic Pellets", warehouse: "Raw WH", current_qty: 800, reorder_point: 1000, shortage_qty: 200, unit: "kg", status: "WARNING" },
    { material_id: 105, material_name: "Packaging Box A", warehouse: "Pack WH", current_qty: 100, reorder_point: 500, shortage_qty: 400, unit: "pcs", status: "CRITICAL" },
];

const MOCK_ALERTS: SmartAlert[] = [
    { id: 1, type: "SHORTAGE", severity: "HIGH", message: "Screw 5mm – Shortage 50 pcs", details: "Reorder immediately. Current: 50", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, type: "PLAN_RISK", severity: "HIGH", message: "Plan A - Risk of Delay", details: "Insufficient materials for production start", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, type: "EXPIRY", severity: "MEDIUM", message: "Sealant - Expires in 3 days", details: "Batch #EXP-001", timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: 4, type: "SYSTEM", severity: "LOW", message: "Backup Completed", details: "Daily system backup successful", timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const MOCK_CHART_TREND: SmartChartData = {
    title: "Stock Value Trend (Last 30d)",
    label: "Total Value (THB)",
    datasets: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
        value: 4000000 + Math.random() * 1000000
    }))
};

const MOCK_PLANS_RISK: PlanAtRisk[] = [
    {
        plan_id: 101,
        plan_name: "Plan A",
        product_name: "Smart Widget X",
        risk_materials: [
            { material_name: "Screw 5mm", required_qty: 100, available_qty: 50, status: "RISK" }
        ],
        overall_status: "RISK",
        start_date: new Date(Date.now() + 86400000 * 2).toISOString()
    },
    {
        plan_id: 102,
        plan_name: "Plan B",
        product_name: "Gadget Pro",
        risk_materials: [
            { material_name: "Aluminum Rod", required_qty: 500, available_qty: 450, status: "RISK" }
        ],
        overall_status: "WARNING",
        start_date: new Date(Date.now() + 86400000 * 5).toISOString()
    }
];

class DashboardService {
    private useMock = false;

    async getSmartStats(): Promise<SmartFactoryStats> {
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return MOCK_STATS;
        }
        try {
            const res = await apiClient.get<ApiResponse<SmartFactoryStats>>('/dashboard/smart/stats');
            return res.data;
        } catch (error) {
            console.error("Failed to fetch smart stats, using fallback", error);
            // Fallback to mock data on error to prevent UI crash
            return MOCK_STATS;
        }
    }

    async getLowStock(limit: number = 10): Promise<LowStockMaterial[]> {
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 600));
            return MOCK_LOW_STOCK.slice(0, limit);
        }
        try {
            const res = await apiClient.get<ApiResponse<LowStockMaterial[]>>(`/dashboard/smart/low-stock?limit=${limit}`);
            return res.data;
        } catch (error) {
            console.error("Failed to fetch low stock, using fallback", error);
            return MOCK_LOW_STOCK;
        }
    }

    async getAlerts(): Promise<SmartAlert[]> {
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 400));
            return MOCK_ALERTS;
        }
        try {
            const res = await apiClient.get<ApiResponse<SmartAlert[]>>('/dashboard/smart/alerts');
            return res.data;
        } catch (error) {
            console.error("Failed to fetch alerts, using fallback", error);
            return MOCK_ALERTS;
        }
    }

    async getStockTrend(range: string = '30d'): Promise<SmartChartData> {
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return MOCK_CHART_TREND;
        }
        try {
            const res = await apiClient.get<ApiResponse<SmartChartData>>(`/dashboard/smart/charts?type=stock_trend&range=${range}`);
            return res.data;
        } catch (error) {
            console.error("Failed to fetch stock trend, using fallback", error);
            return MOCK_CHART_TREND;
        }
    }

    async getPlansAtRisk(): Promise<PlanAtRisk[]> {
        if (this.useMock) {
            await new Promise(resolve => setTimeout(resolve, 700));
            return MOCK_PLANS_RISK;
        }
        try {
            const res = await apiClient.get<ApiResponse<PlanAtRisk[]>>('/dashboard/smart/plans-at-risk');
            return res.data;
        } catch (error) {
            console.error("Failed to fetch plans at risk, using fallback", error);
            return MOCK_PLANS_RISK;
        }
    }

    // Comprehensive fetch for main dashboard
    async getDashboardOverview(): Promise<DashboardOverview> {
        // Parallel fetch
        const [stats, lowStock, alerts, trend, plans] = await Promise.all([
            this.getSmartStats(),
            this.getLowStock(),
            this.getAlerts(),
            this.getStockTrend(),
            this.getPlansAtRisk()
        ]);

        return {
            smartStats: stats,
            lowStock,
            alerts,
            stockTrend: trend,
            plansAtRisk: plans
        };
    }
}

export const dashboardService = new DashboardService();
