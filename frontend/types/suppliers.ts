export interface Supplier {
    id: number;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    rating: number; // 1-5
    status: 'active' | 'inactive' | 'blacklisted';
    category: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    logoUrl?: string;
    paymentTerms: string; // e.g., "Net 30", "Immediate"
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSupplierDTO extends Omit<Supplier, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate' | 'createdAt' | 'updatedAt'> {}
export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> {}

export interface SupplierStats {
    totalSuppliers: number;
    activeSuppliers: number;
    totalSpent: number;
    topSuppliers: Supplier[];
    spendingByCategory: { category: string; amount: number }[];
    monthlySpending: { month: string; amount: number }[];
}
