export interface SmartFactoryStats {
    total_materials: number;
    low_stock_materials: number;
    critical_alerts: number;
    total_stock_value: number;
    active_production_plans: number;
}

export interface LowStockMaterial {
    material_id: number;
    material_name: string;
    warehouse: string;
    current_qty: number;
    reorder_point: number;
    shortage_qty: number;
    unit: string;
    status: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

export interface SmartAlert {
    id: number;
    type: 'SHORTAGE' | 'EXPIRY' | 'PLAN_RISK' | 'SYSTEM';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    details: string;
    timestamp: string;
}

export interface SmartChartDataset {
    date: string;
    value: number;
    category?: string;
}

export interface SmartChartData {
    title: string;
    label: string;
    datasets: SmartChartDataset[];
}

export interface PlanAtRiskRiskMaterial {
    material_name: string;
    required_qty: number;
    available_qty: number;
    status: 'RISK' | 'AVAILABLE';
}

export interface PlanAtRisk {
    plan_id: number;
    plan_name: string;
    product_name: string;
    risk_materials: PlanAtRiskRiskMaterial[];
    overall_status: 'RISK' | 'WARNING' | 'OK';
    start_date: string;
}

export interface DashboardOverview {
    smartStats: SmartFactoryStats;
    lowStock: LowStockMaterial[];
    alerts: SmartAlert[];
    plansAtRisk: PlanAtRisk[];
    stockTrend: SmartChartData;
}
