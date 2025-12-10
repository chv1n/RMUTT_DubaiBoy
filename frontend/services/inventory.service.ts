
import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types/api';
import {
    InventoryBalance,
    InventoryBalanceTotal,
    LotSuggestion,
    LowStockAlert,
    StockAvailability,
    GoodsReceiptDTO,
    GoodsIssueDTO,
    WarehouseTransferDTO,
    InventoryAdjustmentDTO,
    TransactionResponse,
    MovementHistoryItem,
    MovementHistoryResponse
} from '@/types/inventory';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

class InventoryService {
    private readonly balanceEndpoint = '/inventory/balance';
    private readonly transactionEndpoint = '/inventory/transactions';

    // 1. Stock By Warehouse
    async getBalance(params: { warehouse_id?: number; material_id?: number; search?: string; page?: number; limit?: number; include_zero_stock?: boolean }): Promise<ApiResponse<InventoryBalance[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            // Mock Data
            return {
                success: true,
                message: "Success",
                data: [
                    {
                        material_id: 1,
                        material_name: "Steel Bar",
                        warehouse_id: 1,
                        warehouse_name: "Main Warehouse",
                        quantity: 150,
                        mfg_date: "2023-01-01T00:00:00.000Z",
                        exp_date: null,
                        order_number: "LOT-A1"
                    },
                    {
                        material_id: 2,
                        material_name: "Copper Wire",
                        warehouse_id: 1,
                        warehouse_name: "Main Warehouse",
                        quantity: 500,
                        mfg_date: "2023-02-01T00:00:00.000Z",
                        exp_date: null,
                        order_number: "LOT-B2"
                    }
                ],
                meta: {
                    totalItems: 2,
                    itemCount: 2,
                    itemsPerPage: params.limit || 20,
                    totalPages: 1,
                    currentPage: params.page || 1
                }
            };
        }

        const query = new URLSearchParams(params as any).toString();
        return await apiClient.get<ApiResponse<InventoryBalance[]>>(`${this.balanceEndpoint}?${query}`);
    }

    // 2. Total Stock View
    async getTotalBalance(params: { material_id?: number; search?: string; page?: number; limit?: number }): Promise<ApiResponse<InventoryBalanceTotal[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: [
                    {
                        material_id: 1,
                        material_name: "Steel Bar",
                        total_quantity: 250,
                        warehouse_breakdown: [
                            { warehouse_id: 1, warehouse_name: "Main Warehouse", quantity: 150 },
                            { warehouse_id: 2, warehouse_name: "Secondary Warehouse", quantity: 100 }
                        ]
                    }
                ],
                meta: { totalItems: 1, itemCount: 1, itemsPerPage: 20, totalPages: 1, currentPage: 1 }
            };
        }
        const query = new URLSearchParams(params as any).toString();
        return await apiClient.get<ApiResponse<InventoryBalanceTotal[]>>(`${this.balanceEndpoint}/total?${query}`);
    }

    // 3. Lot/Batch Suggestion
    async getLotSuggestion(params: { material_id: number; warehouse_id?: number; strategy?: 'FIFO' | 'FEFO' | 'LIFO'; quantity_needed?: number }): Promise<ApiResponse<LotSuggestion[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: [
                    {
                        inventory_id: 10,
                        material_id: 1,
                        material_name: "Steel Bar",
                        warehouse_id: 1,
                        warehouse_name: "Main Warehouse",
                        quantity: 30,
                        mfg_date: "2023-01-01T00:00:00.000Z",
                        exp_date: "2024-01-01T00:00:00.000Z",
                        order_number: "LOT-OLD-01",
                        suggested_quantity: 30
                    }
                ]
            };
        }
        const query = new URLSearchParams(params as any).toString();
        return await apiClient.get<ApiResponse<LotSuggestion[]>>(`${this.balanceEndpoint}/lot-batch?${query}`);
    }

    // 4. Low Stock Alerts
    async getLowStockAlerts(params: { warehouse_id?: number; page?: number; limit?: number }): Promise<ApiResponse<LowStockAlert[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: [
                    {
                        material_id: 5,
                        material_name: "Screw 5mm",
                        warehouse_id: 1,
                        warehouse_name: "Main Warehouse",
                        current_quantity: 10,
                        reorder_point: 100,
                        shortage_quantity: 90,
                        is_critical: true
                    }
                ],
                meta: { totalItems: 1, itemCount: 1, itemsPerPage: 20, totalPages: 1, currentPage: 1 }
            };
        }
        const query = new URLSearchParams(params as any).toString();
        return await apiClient.get<ApiResponse<LowStockAlert[]>>(`${this.balanceEndpoint}/low-stock-alerts?${query}`);
    }

    // 5. Check Availability
    async checkAvailability(materialId: number, warehouseId: number, quantity: number): Promise<ApiResponse<StockAvailability>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: {
                    available: false,
                    currentQuantity: 150,
                    shortage: 50
                }
            };
        }
        return await apiClient.get<ApiResponse<StockAvailability>>(`${this.balanceEndpoint}/check-availability/${materialId}/${warehouseId}?quantity=${quantity}`);
    }

    // Transactions
    async recordGoodsReceipt(data: GoodsReceiptDTO): Promise<ApiResponse<TransactionResponse>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Goods receipt recorded",
                data: {
                    id: Math.floor(Math.random() * 1000),
                    transaction_type: "IN",
                    quantity_change: data.quantity,
                    reference_number: data.reference_number,
                    reason_remarks: data.reason_remarks,
                    transaction_date: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }
            };
        }
        return await apiClient.post<ApiResponse<TransactionResponse>>(`${this.transactionEndpoint}/goods-receipt`, data);
    }

    async recordGoodsIssue(data: GoodsIssueDTO): Promise<ApiResponse<TransactionResponse>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Goods issue recorded",
                data: {
                    id: Math.floor(Math.random() * 1000),
                    transaction_type: "OUT",
                    quantity_change: -data.quantity,
                    reference_number: data.reference_number,
                    transaction_date: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }
            };
        }
        return await apiClient.post<ApiResponse<TransactionResponse>>(`${this.transactionEndpoint}/goods-issue`, data);
    }

    async recordTransfer(data: WarehouseTransferDTO): Promise<ApiResponse<{ transfer_out_transaction_id: number; transfer_in_transaction_id: number; message: string }>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Transfer completed",
                data: {
                    transfer_out_transaction_id: 101,
                    transfer_in_transaction_id: 102,
                    message: "Transfer completed successfully"
                }
            };
        }
        return await apiClient.post<ApiResponse<{ transfer_out_transaction_id: number; transfer_in_transaction_id: number; message: string }>>(`${this.transactionEndpoint}/transfer`, data);
    }

    async recordAdjustment(data: InventoryAdjustmentDTO): Promise<ApiResponse<TransactionResponse>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Adjustment recorded",
                data: {
                    id: Math.floor(Math.random() * 1000),
                    transaction_type: data.quantity_change > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
                    quantity_change: data.quantity_change,
                    reason_remarks: data.reason_remarks,
                    transaction_date: new Date().toISOString(),
                    created_at: new Date().toISOString()
                }
            };
        }
        return await apiClient.put<ApiResponse<TransactionResponse>>(`${this.transactionEndpoint}/adjustment`, data);
    }

    // Reporting
    async getMovementHistory(params: {
        material_id?: number | string;
        warehouse_id?: number | string;
        transaction_type?: string;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number
    }): Promise<ApiResponse<MovementHistoryResponse | MovementHistoryItem[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();

            // Generate Mock Data
            const mockData: MovementHistoryItem[] = Array.from({ length: 15 }).map((_, i) => ({
                transaction_id: i + 1,
                material_id: params.material_id || (i % 3) + 1,
                material_name: params.material_id ? "Details from ID" : `Material ${String.fromCharCode(65 + (i % 3))}`,
                warehouse_id: params.warehouse_id || (i % 2) + 1,
                warehouse_name: params.warehouse_id ? `Warehouse ${params.warehouse_id}` : (i % 2 === 0 ? "Main Warehouse" : "Secondary Warehouse"),
                transaction_type: ["IN", "OUT", "TRANSFER_IN", "TRANSFER_OUT"][i % 4],
                quantity_change: i % 2 === 0 ? 10 * (i + 1) : -5 * (i + 1),
                reference_number: `REF-${2023000 + i}`,
                reason_remarks: "Mock Entry",
                transaction_date: new Date(Date.now() - i * 86400000).toISOString(),
                created_at: new Date(Date.now() - i * 86400000).toISOString()
            }));

            // Filter by Warehouse if provided
            let filteredData = mockData;
            if (params.warehouse_id) {
                filteredData = filteredData.filter(item => item.warehouse_id === Number(params.warehouse_id));
            }

            // Filter by Material if provided
            if (params.material_id) {
                filteredData = filteredData.filter(item => item.material_id === Number(params.material_id));
            }

            return {
                success: true,
                message: "Success",
                data: filteredData,
                meta: {
                    totalItems: filteredData.length,
                    itemCount: filteredData.length,
                    itemsPerPage: params.limit || 20,
                    totalPages: 1,
                    currentPage: 1
                }
            } as any;
        }

        const query = new URLSearchParams(params as any).toString();
        return await apiClient.get<ApiResponse<MovementHistoryResponse>>(`/inventory/reports/movement-history?${query}`);
    }

    // --- Dashboard Stats ---
    async getStats(): Promise<import('@/types/inventory').InventoryStats> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                totalValue: 2450000,
                totalItems: 14500,
                lowStockItems: 12,
                outOfStockItems: 3,
                movementInToday: 250,
                movementOutToday: 180,
                valueTrends: [
                    { date: "2023-11-01", value: 2400000 },
                    { date: "2023-11-08", value: 2450000 },
                    { date: "2023-11-15", value: 2480000 },
                    { date: "2023-11-22", value: 2420000 },
                    { date: "2023-11-29", value: 2500000 },
                    { date: "2023-12-06", value: 2450000 }
                ],
                movement: {
                    inbound: [
                        { name: "Mon", value: 120 }, { name: "Tue", value: 132 }, { name: "Wed", value: 101 }, { name: "Thu", value: 134 }, { name: "Fri", value: 90 }, { name: "Sat", value: 230 }, { name: "Sun", value: 210 }
                    ],
                    outbound: [
                        { name: "Mon", value: 220 }, { name: "Tue", value: 182 }, { name: "Wed", value: 191 }, { name: "Thu", value: 234 }, { name: "Fri", value: 290 }, { name: "Sat", value: 330 }, { name: "Sun", value: 310 }
                    ]
                }
            };
        }

        try {
            const response = await apiClient.get<ApiResponse<import('@/types/inventory').InventoryStats>>('/inventory/dashboard/stats');
            return response.data;
        } catch (error) {
            console.warn("API inventory stats failed, using fallback", error);
            return {
                totalValue: 0,
                totalItems: 0,
                lowStockItems: 0,
                outOfStockItems: 0,
                movementInToday: 0,
                movementOutToday: 0,
                valueTrends: [],
                movement: { inbound: [], outbound: [] }
            };
        }
    }
}

export const inventoryService = new InventoryService();
