import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types/api';

export interface PurchaseOrderItem {
    po_item_id?: number;
    material_id: number;
    quantity: number;
    unit_price: number;
    subtotal?: number;
    material?: any; // Simplify for now
}

export interface PurchaseOrder {
    po_id: number;
    po_number: string;
    supplier_id: number;
    supplier?: any;
    order_date: string;
    expected_delivery_date: string;
    actual_delivery_date?: string;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'DELAYED';
    total_amount: number;
    notes?: string;
    items: PurchaseOrderItem[];
    created_at: string;
}

export interface SupplierPerformance {
    onTimeRate: number;
    delayCount: number;
    totalOrders: number;
    avgDelayDays: number;
}

export interface Recommendation {
    material: any;
    reason: string;
    suggested_quantity: number;
}

export interface DelayImpact {
    plan_id: number;
    plan_name: string;
    material_name: string;
    conflict_reason: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

class PurchaseOrderService {
    private readonly endpoint = '/purchase-orders';

    async getAll(): Promise<ApiResponse<PurchaseOrder[]>> {
        return await apiClient.get<ApiResponse<PurchaseOrder[]>>(this.endpoint);
    }

    async checkImpact(id: number, date: string): Promise<DelayImpact[]> {
        // @ts-ignore
        return await apiClient.get<DelayImpact[]>(`${this.endpoint}/check-impact/${id}?date=${date}`);
    }

    async getById(id: number): Promise<ApiResponse<PurchaseOrder>> {
        return await apiClient.get<ApiResponse<PurchaseOrder>>(`${this.endpoint}/${id}`);
    }

    async create(data: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
        return await apiClient.post<ApiResponse<PurchaseOrder>>(this.endpoint, data);
    }

    async update(id: number, data: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
        return await apiClient.put<ApiResponse<PurchaseOrder>>(`${this.endpoint}/${id}`, data);
    }

    async getSupplierPerformance(supplierId: number): Promise<SupplierPerformance> {
        // Backend returns the object directly, likely wrapped in standard response if I followed pattern,
        // but looking at valid controller code: `return this.poService.getSupplierPerformance(+id);`
        // NestJS returns object directly by default unless interceptor wraps it.
        // My other services return `ApiResponse`.
        // Let's assume standard client handling.
        const res = await apiClient.get<SupplierPerformance>(`${this.endpoint}/supplier-performance/${supplierId}`);
        // @ts-ignore
        return res.data || res;
    }

    async getRecommendations(): Promise<ApiResponse<Recommendation[]>> {
        // @ts-ignore
        return await apiClient.get<ApiResponse<Recommendation[]>>(`${this.endpoint}/recommendations`);
    }

    async getAlternativeSuppliers(currentSupplierId: number): Promise<any[]> {
        const res = await apiClient.get<any[]>(`${this.endpoint}/alternatives/${currentSupplierId}`);
        // @ts-ignore
        return res.data || res;
    }

    async seed(): Promise<any> {
        return await apiClient.post(`${this.endpoint}/seed`, {});
    }
}

export const purchaseOrderService = new PurchaseOrderService();
