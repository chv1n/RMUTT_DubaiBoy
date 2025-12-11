
export interface InventoryBalance {
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
    mfg_date: string | null;
    exp_date: string | null;
    order_number: string | null;
}

export interface InventoryBalanceTotal {
    material_id: number;
    material_name: string;
    total_quantity: number;
    warehouse_breakdown: {
        warehouse_id: number;
        warehouse_name: string;
        quantity: number;
    }[];
}

export interface LotSuggestion {
    inventory_id: number;
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
    mfg_date: string | null;
    exp_date: string | null;
    order_number: string | null;
    suggested_quantity: number;
}

export interface LowStockAlert {
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    current_quantity: number;
    reorder_point: number;
    shortage_quantity: number;
    is_critical: boolean;
}

export interface StockAvailability {
    available: boolean;
    currentQuantity: number;
    shortage: number;
}

export interface GoodsReceiptDTO {
    material_id: number;
    warehouse_id: number;
    quantity: number;
    reference_number?: string;
    reason_remarks?: string;
    mfg_date?: string;
    exp_date?: string;
    order_number?: string;
}

export interface GoodsIssueDTO {
    material_id: number;
    warehouse_id: number;
    quantity: number;
    reference_number: string;
    reason_remarks?: string;
}

export interface WarehouseTransferDTO {
    material_id: number;
    source_warehouse_id: number;
    target_warehouse_id: number;
    quantity: number;
    reference_number?: string;
    reason_remarks?: string;
}

export interface InventoryAdjustmentDTO {
    material_id: number;
    warehouse_id: number;
    quantity_change: number;
    reason_remarks: string;
    reference_number?: string;
}

export interface TransactionResponse {
    id: number;
    transaction_type: string;
    quantity_change: number;
    reference_number?: string;
    reason_remarks?: string;
    transaction_date: string;
    created_at: string;
}

export interface MovementHistoryItem {
    transaction_id: number;
    material_id: number;
    material_name: string;
    warehouse_id: number;
    warehouse_name: string;
    transaction_type: string; // IN, OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT_IN, ADJUSTMENT_OUT
    quantity_change: number;
    reference_number: string;
    reason_remarks: string;
    transaction_date: string;
    created_at: string;
}

export interface MovementHistorySummary {
    total_in: number;
    total_out: number;
    net_change: number;
}

export interface MovementHistoryResponse {
    data: MovementHistoryItem[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    summary: MovementHistorySummary;
}

export interface InventoryStats {
    totalValue: number;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    movementInToday: number;
    movementOutToday: number;
    valueTrends: { date: string; value: number }[];
    movement: {
        inbound: { name: string; value: number }[];
        outbound: { name: string; value: number }[];
    }
}
