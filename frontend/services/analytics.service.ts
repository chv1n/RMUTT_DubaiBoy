import { apiClient } from '@/lib/api/core/client';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

export interface PredictionRequest {
    material_id: number;
    target_date: string;
}

export interface HistoricalPoint {
    date: string;
    usage: number;
}

export interface PredictionResult {
    material_id: number;
    material_name: string;
    target_date: string;
    predicted_usage: number;
    confidence_score: number;
    unit: string;
    trend_analysis: string;
    factors: string[];
    historical_data: HistoricalPoint[];
    forecast_data: { date: string; predicted: number }[];
}

export interface PredictionOverviewItem {
    material_id: number;
    material_name: string;
    current_stock: number;
    predicted_7d_usage: number;
    status: 'Safe' | 'Warning' | 'Critical';
    trend_sparkline: number[];
}

class AnalyticsService {
    private endpoint = "/analytics/predict";

    async getOverview(): Promise<PredictionOverviewItem[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                {
                    material_id: 101,
                    material_name: "Steel Sheet A4",
                    current_stock: 500,
                    predicted_7d_usage: 620,
                    status: 'Critical',
                    trend_sparkline: [80, 85, 90, 88, 95, 100, 110]
                },
                {
                    material_id: 102,
                    material_name: "Aluminum Rod 10mm",
                    current_stock: 2000,
                    predicted_7d_usage: 450,
                    status: 'Safe',
                    trend_sparkline: [50, 52, 48, 55, 60, 58, 65]
                },
                {
                    material_id: 103,
                    material_name: "Copper Wire 2mm",
                    current_stock: 150,
                    predicted_7d_usage: 140,
                    status: 'Warning',
                    trend_sparkline: [20, 22, 25, 24, 28, 30, 29]
                },
                {
                    material_id: 104,
                    material_name: "Plastic Pellets (Type A)",
                    current_stock: 5000,
                    predicted_7d_usage: 1200,
                    status: 'Safe',
                    trend_sparkline: [150, 160, 155, 170, 165, 180, 175]
                },
                {
                    material_id: 105,
                    material_name: "Packaging Box L",
                    current_stock: 80,
                    predicted_7d_usage: 200,
                    status: 'Critical',
                    trend_sparkline: [30, 35, 40, 45, 50, 55, 60]
                }
            ];
        }

        const response = await apiClient.get<{ data: PredictionOverviewItem[] }>(`${this.endpoint}/overview`);
        return response.data.data;
    }

    async predictMaterialUsage(request: PredictionRequest): Promise<PredictionResult> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();

            // Generate some mock historical and forecast data based on input
            const history = [];
            const forecast = [];
            const today = new Date();

            // 7 days history
            for (let i = 7; i > 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                history.push({
                    date: d.toISOString().split('T')[0],
                    usage: Math.floor(Math.random() * 50) + 100 // Random 100-150
                });
            }

            // Forecast up to target date (simplified, just doing 5 days ahead of today for visualization)
            // In a real scenario, this would go from today to target_date
            const target = new Date(request.target_date);
            const daysDiff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
            const forecastDays = Math.max(daysDiff, 1);

            let lastValue = 125;
            for (let i = 1; i <= forecastDays; i++) { // Generate up to target date
                const d = new Date(today);
                d.setDate(d.getDate() + i);
                lastValue += Math.random() * 10 - 2; // Slight upward trend
                forecast.push({
                    date: d.toISOString().split('T')[0],
                    predicted: Math.floor(lastValue)
                });
            }

            return {
                material_id: request.material_id,
                material_name: "Material #" + request.material_id,
                target_date: request.target_date,
                predicted_usage: Math.floor(lastValue),
                confidence_score: 0.85 + (Math.random() * 0.1),
                unit: "Units",
                trend_analysis: "Increasing Demand",
                factors: ["Seasonal Peak", "Large Order Incoming"],
                historical_data: history,
                forecast_data: forecast
            };
        }

        const response = await apiClient.post<{ data: PredictionResult }>(`${this.endpoint}/material`, request);
        return response.data.data;
    }
}

export const analyticsService = new AnalyticsService();
