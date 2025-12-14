
export interface Warehouse {
    id: number;
    name: string;
    code: string;
    phone?: string;
    email?: string;
    address?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

export interface WarehouseDTO {
    id: number;
    warehouse_name: string;
    warehouse_code: string;
    warehouse_phone?: string;
    warehouse_email?: string;
    warehouse_address?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface CreateWarehouseDTO {
    warehouse_name: string;
    warehouse_code: string;
    warehouse_phone?: string;
    warehouse_email?: string;
    warehouse_address?: string;
    is_active?: boolean;
}

export interface UpdateWarehouseDTO extends Partial<CreateWarehouseDTO> { }

export interface MaterialInventory {
    id: number;
    materialId: number;
    materialName: string;
    warehouseId: number;
    warehouseName: string;
    supplierId: number;
    supplierName: string;
    quantity: number;
    orderNumber?: string;
    mfgDate?: string;
    expDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MaterialInventoryDTO {
    id: number;
    material: { material_id: number; material_name: string };
    warehouse: { id: number; warehouse_name: string };
    supplier: { supplier_id: number; supplier_name: string };
    quantity: number;
    order_number?: string;
    mfg_date?: string;
    exp_date?: string;
    created_at: string;
    updated_at: string;
}

export interface InventoryTransaction {
    id: number;
    type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
    quantity: number;
    materialName: string;
    warehouseName: string;
    reason?: string;
    createdAt: string;
    createdBy: string;
}

export interface InventoryTransactionDTO {
    id: number;
    transaction_type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER'; // Guessing enum values
    quantity: number;
    material: { material_name: string };
    warehouse: { warehouse_name: string };
    reason?: string;
    created_at: string;
    created_by?: string; // or relation
}

// --- Reporting API Types ---

export interface MovementHistoryResult {
    data: {
        transaction_id: number;
        material_id: number;
        material_name: string;
        warehouse_id: number;
        warehouse_name: string;
        transaction_type: string; // IN, OUT, etc.
        quantity_change: number;
        reference_number: string;
        reason_remarks: string;
        transaction_date: string;
        created_at: string;
    }[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    summary: {
        total_in: number;
        total_out: number;
        net_change: number;
    };
}

export interface StockLocationItem {
    material_id: number;
    material_name: string;
    quantity: number;
    mfg_date?: string;
    exp_date?: string;
    order_number?: string;
}

export interface StockLocationResult {
    warehouse_id: number;
    warehouse_name: string;
    warehouse_code: string;
    materials: StockLocationItem[];
    total_items: number;
}

// --- Dashboard API Types ---

export interface WarehouseDashboardStats {
    total_warehouses: number;
    active_warehouses: number;
    total_inventory_value: number;
    total_stock_items: number;
    low_stock_alerts: number;
    utilization_rate: number;
}

export interface WarehouseStockDistributionItem {
    warehouse_name: string;
    value: number;
    item_count: number;
    color?: string; // Optional for UI mapping
}

export interface WarehouseCapacityItem {
    warehouse_name: string;
    capacity: number;
    used: number;
    percentage: number;
}

// Deprecated or Legacy Stats
export interface WarehouseStatsLegacy {
    totalWarehouses: number;
    activeWarehouses: number;
    totalValue: number;
    totalItems: number;
    lowStockAlerts: number;
    utilizationRate: number;
    distribution: { name: string; value: number; count: number; color?: string }[];
    capacity?: { name: string; capacity: number; used: number; percentage: number }[];
}
