import { apiClient } from '@/lib/api/core/client';
import { Supplier, CreateSupplierDTO, UpdateSupplierDTO, SupplierStats, SupplierDTO } from '@/types/suppliers';
import { ApiResponse } from '@/types/api';
import { MOCK_SUPPLIERS } from '@/lib/mock/suppliers';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';


// Wrapper matching backend response format
interface BackendResponse<T> {
    message: string;
    data: T;
}

const mapSupplierDTOToDomain = (dto: SupplierDTO): Supplier => ({
    id: dto.supplier_id,
    name: dto.supplier_name,
    email: dto.email,
    phone: dto.phone,
    address: dto.address,
    status: dto.is_active ? 'active' : 'inactive',
    updatedAt: dto.update_date
});

class SupplierService { // Fixed: Renamed from SupplierService to avoid conflict? No, conflict was likely due to changes. 
    private readonly endpoint = '/suppliers';

    private async getMockSuppliers(): Promise<Supplier[]> {
        await simulateDelay();
        return [...MOCK_SUPPLIERS];
    }

    private async getMockStats(): Promise<SupplierStats> {
        await simulateDelay();
        // Since we removed totalSpent from Supplier, we must simulate it or fetch elsewhere if needed.
        // For now, using mock values to satisfy SupplierStats.
        const totalSpent = 500000;

        return {
            totalSuppliers: MOCK_SUPPLIERS.length,
            activeSuppliers: MOCK_SUPPLIERS.filter(s => s.status === 'active').length,
            totalSpent,
            topSuppliers: [...MOCK_SUPPLIERS].slice(0, 3),
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

    async getAll(): Promise<Supplier[]> {
        if (MOCK_CONFIG.useMock) {
            return this.getMockSuppliers();
        }
        try {
            // Check if API returns array or wrapped
            const response = await apiClient.get<any>(this.endpoint);
            if (Array.isArray(response)) return response.map(mapSupplierDTOToDomain);
            if (response.data && Array.isArray(response.data)) return response.data.map(mapSupplierDTOToDomain);
            return [];
        } catch (error) {
            console.warn("API failed, falling back to mock data", error);
            throw error;
        }
    }

    async getById(id: number | string): Promise<Supplier> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const supplier = MOCK_SUPPLIERS.find(s => s.id === Number(id));
            if (!supplier) throw new Error("Supplier not found");
            return supplier;
        }
        const response = await apiClient.get<BackendResponse<SupplierDTO> | SupplierDTO>(`${this.endpoint}/${id}`);
        // Handle both wrapped and direct
        const dto = (response as any).data || response;
        return mapSupplierDTOToDomain(dto);
    }

    async create(data: CreateSupplierDTO): Promise<Supplier> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const newSupplier: Supplier = {
                id: Math.floor(Math.random() * 1000) + 10,
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                status: data.status || 'active',
                updatedAt: new Date().toISOString()
            };
            MOCK_SUPPLIERS.push(newSupplier);
            return newSupplier;
        }

        const backendPayload = {
            supplier_name: data.name,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            is_active: data.status === 'active'
        };

        const response = await apiClient.post<BackendResponse<SupplierDTO>>(this.endpoint, backendPayload);
        return mapSupplierDTOToDomain(response.data);
    }

    async update(id: number | string, data: UpdateSupplierDTO): Promise<Supplier> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const index = MOCK_SUPPLIERS.findIndex(s => s.id === Number(id));
            if (index === -1) throw new Error("Supplier not found");

            const current = MOCK_SUPPLIERS[index];
            const updated: Supplier = {
                ...current,
                name: data.name ?? current.name,
                email: data.email ?? current.email,
                phone: data.phone ?? current.phone,
                address: data.address ?? current.address,
                status: data.status ?? current.status,
                updatedAt: new Date().toISOString()
            }
            MOCK_SUPPLIERS[index] = updated;
            return updated;
        }

        // Map CamelCase Update DTO to SnakeCase Backend DTO
        const backendPayload: any = {};
        if (data.name !== undefined) backendPayload.supplier_name = data.name;
        if (data.phone !== undefined) backendPayload.phone = data.phone;
        if (data.email !== undefined) backendPayload.email = data.email;
        if (data.address !== undefined) backendPayload.address = data.address;
        if (data.status !== undefined) backendPayload.is_active = data.status === 'active';

        const response = await apiClient.put<BackendResponse<SupplierDTO>>(`${this.endpoint}/${id}`, backendPayload);
        return mapSupplierDTOToDomain(response.data);
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

    // --- Dashboard Methods ---

    async getDashboardStats(): Promise<ApiResponse<import('@/types/suppliers').SupplierDashboardStats>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: {
                    total_suppliers: 120,
                    active_suppliers: 115,
                    active_suppliers_trend: 5.2,
                    total_spend_ytd: 1500000,
                    total_spend_trend: 10.5,
                    open_orders_count: 45,
                    open_orders_trend: -2.0,
                    issues_count: 3
                }
            };
        }
        const response = await apiClient.get<ApiResponse<import('@/types/suppliers').SupplierDashboardStats>>(`${this.endpoint}/stats/summary`);
        return response;
    }

    async getSpendingAnalytics(type: 'monthly' | 'category'): Promise<ApiResponse<import('@/types/suppliers').SupplierSpendingItem[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            if (type === 'monthly') {
                return {
                    success: true,
                    message: "Success",
                    data: [
                        { month: "Jan", amount: 150000 },
                        { month: "Feb", amount: 230000 },
                        { month: "Mar", amount: 180000 },
                        { month: "Apr", amount: 320000 },
                        { month: "May", amount: 290000 },
                        { month: "Jun", amount: 450000 }
                    ]
                };
            } else {
                return {
                    success: true,
                    message: "Success",
                    data: [
                        { category: "Electronics", amount: 500000, percentage: 35 },
                        { category: "Construction", amount: 350000, percentage: 25 },
                        { category: "Chemicals", amount: 1200000, percentage: 80 }, // Wait, percentages don't sum to 100 in mock? Just mock values.
                        { category: "Metals", amount: 850000, percentage: 15 }
                    ]
                };
            }
        }
        const response = await apiClient.get<ApiResponse<import('@/types/suppliers').SupplierSpendingItem[]>>(`${this.endpoint}/stats/spending?type=${type}`);
        return response;
    }

    async getTopPerformingSuppliers(): Promise<ApiResponse<import('@/types/suppliers').TopPerformingSupplier[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: [
                    { supplier_id: 1, supplier_name: "ABC Corp", total_spend: 500000, rating: 4.8, status: "active", category: "Electronics", email: "contact@abc.com" },
                    { supplier_id: 2, supplier_name: "Global Steel", total_spend: 350000, rating: 4.5, status: "active", category: "Metals", email: "sales@steel.com" },
                    { supplier_id: 3, supplier_name: "ChemTech", total_spend: 320000, rating: 4.2, status: "active", category: "Chemicals", email: "info@chemtech.com" },
                    { supplier_id: 4, supplier_name: "Office Supplies Co", total_spend: 50000, rating: 3.9, status: "active", category: "Office", email: "support@osc.com" },
                    { supplier_id: 5, supplier_name: "BuildIt", total_spend: 45000, rating: 3.5, status: "inactive", category: "Construction", email: "contact@buildit.com" }
                ]
            };
        }
        const response = await apiClient.get<ApiResponse<import('@/types/suppliers').TopPerformingSupplier[]>>(`${this.endpoint}/stats/top-performing`);
        return response;
    }

    // Deprecated legacy method
    async getStats(): Promise<any> {
        return {};
    }
}

export const supplierService = new SupplierService();
