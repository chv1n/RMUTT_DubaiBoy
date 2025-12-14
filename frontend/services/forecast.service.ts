import { apiClient } from '@/lib/api/core/client';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';
import { PredictRequest, PredictResponse, RetrainResponse } from '@/types/forecast';

class ForecastService {
    private endpoint = "/forecast";

    async retrainModel(): Promise<RetrainResponse> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay(); // Simulate longer training time
            return {
                success: true,
                message: "สำเร็จ",
                data: {
                    success: true,
                    trained_models: [29, 37, 41],
                    rows_used: 120
                }
            };
        }
        const response = await apiClient.post<RetrainResponse>(`${this.endpoint}/update`, {});
        return response;
    }

    async predict(request: PredictRequest): Promise<PredictResponse> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();

            // Mock Data Generation based on productId
            const basePrediction = 1000 + (request.productId * 50);
            const predictions = Array.from({ length: 1 }, () => basePrediction + (Math.random() * 50));

            return {
                success: true,
                message: "สำเร็จ",
                data: {
                    product: {
                        product_id: request.productId,
                        product_name: `Product ${request.productId}`, // In real app, name comes from backend
                    },
                    predictions: predictions,
                    confidence: {
                        std: 37.32,
                        interval_68: [
                            { lower: basePrediction - 37, upper: basePrediction + 37 }
                        ],
                        interval_95: [
                            { lower: basePrediction - 74, upper: basePrediction + 74 }
                        ]
                    },
                    materialUsage: [
                        {
                            material_id: 1,
                            material_name: "Aluminum Sheet 2mm",
                            usage_per_piece: "12",
                            total_usage: predictions[0] * 12,
                            unit: {
                                unit_id: 1,
                                unit_name: "แผ่น"
                            }
                        },
                        {
                            material_id: 2,
                            material_name: "Steel Bolt M5",
                            usage_per_piece: "4",
                            total_usage: predictions[0] * 4,
                            unit: {
                                unit_id: 2,
                                unit_name: "ตัว"
                            }
                        },
                        {
                            material_id: 3,
                            material_name: "Plastic Cover",
                            usage_per_piece: "1",
                            total_usage: predictions[0] * 1,
                            unit: {
                                unit_id: 2,
                                unit_name: "ชิ้น"
                            }
                        }
                    ]
                }
            };
        }
        const response = await apiClient.post<PredictResponse>(`${this.endpoint}/predict`, request);
        return response;
    }
}

export const forecastService = new ForecastService();
