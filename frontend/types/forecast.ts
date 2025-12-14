export interface RetrainResponse {
    success: boolean;
    message: string;
    data: {
        success: boolean;
        trained_models: number[];
        rows_used: number;
    };
}

export interface PredictRequest {
    productId: number;
    days: number;
}

export interface ConfidenceInterval {
    lower: number;
    upper: number;
}

export interface ConfidenceData {
    std: number;
    interval_68: ConfidenceInterval[];
    interval_95: ConfidenceInterval[];
}

export interface MaterialUsageForecast {
    material_id: number;
    material_name: string;
    usage_per_piece: string;
    total_usage: number;
    unit: {
        unit_id: number;
        unit_name: string;
    };
}

export interface ForecastData {
    product: {
        product_id: number;
        product_name: string;
        boms: {
            material: {
                material_id: number;
                cost_per_unit: number;
            };
        }[];
    };
    predictions: number[];
    confidence: ConfidenceData;
    materialUsage: MaterialUsageForecast[];
}

export interface PredictResponse {
    success: boolean;
    message: string;
    data: ForecastData;
}
