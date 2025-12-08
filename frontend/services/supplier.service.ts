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

    async getStats(): Promise<SupplierStats> {
        if (MOCK_CONFIG.useMock) {
            return this.getMockStats();
        }
        try {
            const response = await apiClient.get<ApiResponse<any>>(`${this.endpoint}/stats`);
            const data = response.data;
            if (data.topSuppliers && Array.isArray(data.topSuppliers)) {
                data.topSuppliers = data.topSuppliers.map(mapSupplierDTOToDomain);
            }
            return data as SupplierStats;
        } catch (error) {
            console.warn("API failed, falling back to mock data", error);
            return this.getMockStats();
        }
    }
}

export const supplierService = new SupplierService();
