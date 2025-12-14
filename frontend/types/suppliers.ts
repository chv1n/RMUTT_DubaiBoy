export interface Supplier {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: 'active' | 'inactive' | 'blacklisted';
    updatedAt?: string | null;

    // Extended Details (Mock/Enriched)
    contactPerson?: string;
    rating?: number;
    category?: string;
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: string;
    paymentTerms?: string;
    logoUrl?: string;
}

export interface SupplierDTO {
    supplier_id: number;
    supplier_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    update_date: string | null;
}

export interface CreateSupplierDTO {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: 'active' | 'inactive';
}
export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> { }

// --- Dashboard API Types ---

export interface SupplierDashboardStats {
    total_suppliers: number;
    active_suppliers: number;
    total_spend_ytd: number;
    active_suppliers_trend: number;
    total_spend_trend: number;
    open_orders_count?: number;
    open_orders_trend?: number;
    issues_count?: number;
}

export interface SupplierSpendingItem {
    month?: string;
    category?: string;
    amount: number;
    percentage?: number;
}

export interface TopPerformingSupplier {
    supplier_id: number;
    supplier_name: string;
    total_spend: number;
    rating: number;
    status: string;
    logoUrl?: string;
    email?: string;
    category?: string;
}

export interface SupplierStats {
    totalSuppliers: number;
    activeSuppliers: number;
    totalSpent: number;
    topSuppliers: Supplier[];
    spendingByCategory: { category: string; amount: number }[];
    monthlySpending: { month: string; amount: number }[];
}

