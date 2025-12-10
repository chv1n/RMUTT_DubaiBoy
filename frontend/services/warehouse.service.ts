
import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types/api';
import { Warehouse, WarehouseDTO, CreateWarehouseDTO, UpdateWarehouseDTO } from '@/types/warehouse';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

// Mock Data
const MOCK_WAREHOUSES: WarehouseDTO[] = [
    {
        id: 1,
        warehouse_name: "Main Warehouse",
        warehouse_code: "WH-001",
        warehouse_phone: "02-123-4567",
        warehouse_address: "123 Industrial Estate, Bangkok",
        warehouse_email: "warehouse.main@example.com",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        warehouse_name: "Chemical Storage",
        warehouse_code: "WH-002",
        warehouse_phone: "02-123-4568",
        warehouse_address: "123 Industrial Estate, Bangkok",
        warehouse_email: "warehouse.chem@example.com",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        warehouse_name: "Cold Storage",
        warehouse_code: "WH-003",
        warehouse_phone: "02-123-4569",
        warehouse_address: "123 Industrial Estate, Bangkok",
        warehouse_email: "warehouse.cold@example.com",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

const mapDTOToDomain = (dto: WarehouseDTO): Warehouse => ({
    id: dto.id,
    name: dto.warehouse_name,
    code: dto.warehouse_code,
    phone: dto.warehouse_phone,
    email: dto.warehouse_email,
    address: dto.warehouse_address,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    deletedAt: dto.deleted_at
});

class WarehouseService {
    private readonly endpoint = '/warehouse';

    async getAll(page: number = 1, limit: number = 10, search: string = "", status: string = ""): Promise<ApiResponse<Warehouse[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            let filtered = [...MOCK_WAREHOUSES];
            
            if (search) {
                const lowerSearch = search.toLowerCase();
                filtered = filtered.filter(w => 
                    w.warehouse_name.toLowerCase().includes(lowerSearch) ||
                    w.warehouse_code.toLowerCase().includes(lowerSearch)
                );
            }

            if (status !== "" && status !== "all") {
                const isActive = status === "active";
                filtered = filtered.filter(w => w.is_active === isActive);
            }

            const start = (page - 1) * limit;
            const paginatedData = filtered.slice(start, start + limit);

            return {
                success: true,
                data: paginatedData.map(mapDTOToDomain),
                meta: {
                    totalItems: filtered.length,
                    itemCount: paginatedData.length,
                    itemsPerPage: limit,
                    totalPages: Math.ceil(filtered.length / limit),
                    currentPage: page
                }
            };
        }

        const is_active_param = status === "all" || status === "" ? "" : `&is_active=${status === "active"}`;
        const response = await apiClient.get<ApiResponse<WarehouseDTO[]>>(`${this.endpoint}?page=${page}&limit=${limit}&search=${search}${is_active_param}`);
        
        return {
            ...response,
            data: response.data.map(mapDTOToDomain)
        };
    }

    async getById(id: number): Promise<Warehouse> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const found = MOCK_WAREHOUSES.find(w => w.id === id);
            if (!found) throw new Error("Warehouse not found");
            return mapDTOToDomain(found);
        }
        const response = await apiClient.get<ApiResponse<WarehouseDTO>>(`${this.endpoint}/${id}`);
        return mapDTOToDomain(response.data);
    }

    async create(data: CreateWarehouseDTO): Promise<Warehouse> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const newWarehouse: WarehouseDTO = {
                id: Math.floor(Math.random() * 1000),
                ...data,
                is_active: data.is_active ?? true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            return mapDTOToDomain(newWarehouse);
        }
        const response = await apiClient.post<{ message: string, data: WarehouseDTO }>(this.endpoint, data);
        return mapDTOToDomain(response.data);
    }

    async update(id: number, data: UpdateWarehouseDTO): Promise<Warehouse> {
         if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const found = MOCK_WAREHOUSES.find(w => w.id === id);
            if (!found) throw new Error("Warehouse not found");
            
            const updated: WarehouseDTO = {
                ...found,
                ...data,
                updated_at: new Date().toISOString()
            };
            return mapDTOToDomain(updated);
        }
        const response = await apiClient.put<{ message: string, data: WarehouseDTO }>(`${this.endpoint}/${id}`, data);
        return mapDTOToDomain(response.data);
    }

    async getInventory(warehouseId: number, page: number = 1, limit: number = 10): Promise<ApiResponse<import('@/types/warehouse').MaterialInventory[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const mockInventory: import('@/types/warehouse').MaterialInventory[] = [
                {
                    id: 1, materialId: 101, materialName: "Silicon Wafer 300mm",
                    warehouseId: warehouseId, warehouseName: "Main Warehouse",
                    supplierId: 501, supplierName: "Siam Silicon",
                    quantity: 5000, orderNumber: "PO-2023-001",
                    mfgDate: "2023-01-15T00:00:00Z", expDate: "2025-01-15T00:00:00Z",
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                },
                {
                    id: 2, materialId: 102, materialName: "Photoresist A",
                    warehouseId: warehouseId, warehouseName: "Main Warehouse",
                    supplierId: 502, supplierName: "ChemTech",
                    quantity: 200, orderNumber: "PO-2023-045",
                    mfgDate: "2023-06-01T00:00:00Z", expDate: "2024-06-01T00:00:00Z",
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                }
            ];
            
            return {
                success: true,
                data: mockInventory,
                meta: {
                    totalItems: 2, itemCount: 2, itemsPerPage: limit, totalPages: 1, currentPage: page
                }
            };
        }
        const response = await apiClient.get<ApiResponse<import('@/types/warehouse').MaterialInventoryDTO[]>>(`/material-inventory?warehouse_id=${warehouseId}&page=${page}&limit=${limit}`);
        
        return {
            ...response,
            data: response.data.map(dto => ({
                id: dto.id,
                materialId: dto.material?.material_id ?? 0,
                materialName: dto.material?.material_name ?? "Unknown",
                warehouseId: dto.warehouse?.id ?? 0,
                warehouseName: dto.warehouse?.warehouse_name ?? "Unknown",
                supplierId: dto.supplier?.supplier_id ?? 0,
                supplierName: dto.supplier?.supplier_name ?? "Unknown",
                quantity: dto.quantity,
                orderNumber: dto.order_number,
                mfgDate: dto.mfg_date,
                expDate: dto.exp_date,
                createdAt: dto.created_at,
                updatedAt: dto.updated_at
            }))
        };
    }

    async getTransactions(warehouseId: number, page: number = 1, limit: number = 10): Promise<ApiResponse<import('@/types/warehouse').InventoryTransaction[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const mockTrx: import('@/types/warehouse').InventoryTransaction[] = [
                {
                    id: 1, type: 'IN', quantity: 1000,
                    materialName: "Silicon Wafer 300mm", warehouseName: "Main Warehouse",
                    reason: "Purchase Order #PO-2023-001",
                    createdAt: new Date(Date.now() - 86400000).toISOString(), createdBy: "Admin"
                },
                {
                    id: 2, type: 'OUT', quantity: 50,
                    materialName: "Photoresist A", warehouseName: "Main Warehouse",
                    reason: "Production Batch #B-999",
                    createdAt: new Date(Date.now() - 43200000).toISOString(), createdBy: "Operator"
                }
            ];
             return {
                success: true,
                data: mockTrx,
                meta: {
                    totalItems: 2, itemCount: 2, itemsPerPage: limit, totalPages: 1, currentPage: page
                }
            };
        }
        const response = await apiClient.get<ApiResponse<import('@/types/warehouse').InventoryTransactionDTO[]>>(`/inventory-transaction?warehouse_id=${warehouseId}&page=${page}&limit=${limit}`);
         return {
            ...response,
            data: response.data.map(dto => ({
                id: dto.id,
                type: dto.transaction_type,
                quantity: dto.quantity,
                materialName: dto.material?.material_name ?? "Unknown",
                warehouseName: dto.warehouse?.warehouse_name ?? "Unknown",
                reason: dto.reason,
                createdAt: dto.created_at,
                createdBy: dto.created_by ?? "System"
            }))
        };
    }

    async delete(id: number): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.delete(`${this.endpoint}/${id}`);
    }

    async restore(id: number): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return; // Mock restore
        }
         await apiClient.patch(`${this.endpoint}/${id}/restore`, {});
    }
}

export const warehouseService = new WarehouseService();
