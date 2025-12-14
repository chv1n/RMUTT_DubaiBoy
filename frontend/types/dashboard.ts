export interface DashboardOverview {
    stats: {
        total_revenue: number; // Or Total Inventory Value if revenue not tracked
        revenue_change: number;
        total_orders: number; // Or Production Plans
        orders_change: number;
        active_users: number;
        users_change: number;
        low_stock_items: number;
        low_stock_change: number;
    };
    revenue_trend: {
        month: string;
        value: number; // Revenue/Production Value
        target: number; // Target/Expenses
    }[];
    recent_activities: {
        id: number;
        description: string;
        timestamp: string;
        type: 'success' | 'warning' | 'info' | 'danger';
    }[];
    quick_actions: {
        label: string;
        icon: string;
        path: string;
    }[];
}
