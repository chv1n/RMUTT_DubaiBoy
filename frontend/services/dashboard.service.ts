import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types/api';
import { DashboardOverview } from '@/types/dashboard';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

class DashboardService {
    private readonly endpoint = '/dashboard';

    async getOverview(): Promise<ApiResponse<DashboardOverview>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: {
                    stats: {
                        total_revenue: 15430000,
                        revenue_change: 12.5,
                        total_orders: 145,
                        orders_change: 8.2,
                        active_users: 1254,
                        users_change: 5.4,
                        low_stock_items: 23,
                        low_stock_change: -2.1
                    },
                    revenue_trend: [
                        { month: 'Jan', value: 4500000, target: 4000000 },
                        { month: 'Feb', value: 3800000, target: 4100000 },
                        { month: 'Mar', value: 5200000, target: 4200000 },
                        { month: 'Apr', value: 4900000, target: 4300000 },
                        { month: 'May', value: 6100000, target: 4400000 },
                        { month: 'Jun', value: 5800000, target: 4500000 }
                    ],
                    recent_activities: [
                        { id: 1, description: "New production plan 'Q3 Batch' approved", timestamp: "10 min ago", type: "success" },
                        { id: 2, description: "Low stock alert: 'Aluminum Rod 5mm'", timestamp: "45 min ago", type: "warning" },
                        { id: 3, description: "User 'John Doe' updated inventory", timestamp: "2 hours ago", type: "info" },
                        { id: 4, description: "Shipment #SH-2024-001 received", timestamp: "5 hours ago", type: "success" }
                    ],
                    quick_actions: [] // Handled in UI for now
                }
            };
        }
        return apiClient.get<ApiResponse<DashboardOverview>>(`${this.endpoint}/overview`);
    }
}

export const dashboardService = new DashboardService();
