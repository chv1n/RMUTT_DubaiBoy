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
export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> {}

export interface SupplierStats {
    totalSuppliers: number;
    activeSuppliers: number;
    totalSpent: number;
    topSuppliers: Supplier[];
    spendingByCategory: { category: string; amount: number }[];
    monthlySpending: { month: string; amount: number }[];
}
