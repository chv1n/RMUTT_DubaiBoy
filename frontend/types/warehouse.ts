
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

export interface UpdateWarehouseDTO extends Partial<CreateWarehouseDTO> {}

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
