import { apiClient } from '@/lib/api/core/client';
import { Supplier, CreateSupplierDTO, UpdateSupplierDTO, SupplierStats } from '@/types/suppliers';
import { MOCK_SUPPLIERS } from '@/lib/mock/suppliers';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

class SupplierService {
    private readonly endpoint = '/suppliers';

    async getAll(): Promise<Supplier[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [...MOCK_SUPPLIERS];
        }
        return apiClient.get<Supplier[]>(this.endpoint);
    }

    async getById(id: number | string): Promise<Supplier> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const supplier = MOCK_SUPPLIERS.find(s => s.id === Number(id));
            if (!supplier) throw new Error("Supplier not found");
            return supplier;
        }
        return apiClient.get<Supplier>(`${this.endpoint}/${id}`);
    }

    async create(data: CreateSupplierDTO): Promise<Supplier> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const newSupplier: Supplier = {
                ...data,
                id: Math.floor(Math.random() * 1000) + 10,
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: new Date().toISOString().split('T')[0],
                logoUrl: data.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
            };
            MOCK_SUPPLIERS.push(newSupplier);
            return newSupplier;
        }
        return apiClient.post<Supplier>(this.endpoint, data);
    }

    async update(id: number | string, data: UpdateSupplierDTO): Promise<Supplier> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const index = MOCK_SUPPLIERS.findIndex(s => s.id === Number(id));
            if (index === -1) throw new Error("Supplier not found");
            
            MOCK_SUPPLIERS[index] = { ...MOCK_SUPPLIERS[index], ...data };
            return MOCK_SUPPLIERS[index];
        }
        return apiClient.put<Supplier>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number | string): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const index = MOCK_SUPPLIERS.findIndex(s => s.id === Number(id));
            if (index !== -1) {
                MOCK_SUPPLIERS.splice(index, 1);
            }
            return;
        }
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }

    async getStats(): Promise<SupplierStats> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const totalSpent = MOCK_SUPPLIERS.reduce((sum, s) => sum + s.totalSpent, 0);
            return {
                totalSuppliers: MOCK_SUPPLIERS.length,
                activeSuppliers: MOCK_SUPPLIERS.filter(s => s.status === 'active').length,
                totalSpent,
                topSuppliers: [...MOCK_SUPPLIERS].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3),
                spendingByCategory: [
                    { category: "Electronics", amount: 500000 },
                    { category: "Construction", amount: 350000 },
                    { category: "Chemicals", amount: 1200000 },
                    { category: "Metals", amount: 850000 },
                    { category: "Office Supplies", amount: 12000 }
                ],
                monthlySpending: [
                    { month: "Jan", amount: 150000 },
                    { month: "Feb", amount: 230000 },
                    { month: "Mar", amount: 180000 },
                    { month: "Apr", amount: 320000 },
                    { month: "May", amount: 290000 },
                    { month: "Jun", amount: 450000 }
                ]
            };
        }
        return apiClient.get<SupplierStats>(`${this.endpoint}/stats`);
    }
}

export const supplierService = new SupplierService();
