
import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types/api';
import { Warehouse, WarehouseDTO, CreateWarehouseDTO, UpdateWarehouseDTO, StockLocationResult, MovementHistoryResult } from '@/types/warehouse';
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
        // Legacy or Alternative view - keeping for compatibility if utilized elsewhere
        // But for Warehouse Detail we will prefer getStockLocation
        return this.getInventoryLegacy(warehouseId, page, limit);
    }

    // New Method based on Reporting Spec: Stock Location
    async getStockLocation(warehouseId: number, search: string = "", page: number = 1, limit: number = 10): Promise<ApiResponse<StockLocationResult>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const warehouse = MOCK_WAREHOUSES.find(w => w.id === warehouseId);
            const mockResult: StockLocationResult = {
                warehouse_id: warehouseId,
                warehouse_name: warehouse?.warehouse_name || "Unknown",
                warehouse_code: warehouse?.warehouse_code || "UNKNOWN",
                total_items: 5,
                materials: [
                    { material_id: 1, material_name: "Steel Bar", quantity: 100, mfg_date: "2023-01-01", exp_date: "2024-01-01", order_number: "LOT-001" },
                    { material_id: 2, material_name: "Copper Wire", quantity: 500, mfg_date: "2023-02-01", exp_date: "2025-01-01", order_number: "LOT-002" },
                    { material_id: 3, material_name: "Plastic Pellets", quantity: 2000, mfg_date: "2023-03-01", exp_date: "2024-03-01", order_number: "LOT-003" },
                    { material_id: 4, material_name: "Aluminum Sheet", quantity: 300, mfg_date: "2023-04-01", exp_date: "2024-04-01", order_number: "LOT-004" },
                    { material_id: 5, material_name: "Rubber Seal", quantity: 1000, mfg_date: "2023-05-01", exp_date: "2024-05-01", order_number: "LOT-005" },
                ]
            };

            // Filter mock data
            if (search) {
                mockResult.materials = mockResult.materials.filter(m => m.material_name.toLowerCase().includes(search.toLowerCase()));
                mockResult.total_items = mockResult.materials.length;
            }

            return {
                success: true,
                message: "Success",
                data: mockResult
            };
        }

        const response = await apiClient.get<ApiResponse<StockLocationResult>>(`/inventory/reports/stock-location?warehouse_id=${warehouseId}`);
        return response;
    }

    // New Method based on Reporting Spec: Movement History
    async getMovementHistory(warehouseId: number, page: number = 1, limit: number = 10): Promise<ApiResponse<MovementHistoryResult>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const mockData = [
                {
                    transaction_id: 1, material_id: 1, material_name: "Steel Bar",
                    warehouse_id: warehouseId, warehouse_name: "Main Warehouse",
                    transaction_type: "IN", quantity_change: 100,
                    reference_number: "GR-20231201-001", reason_remarks: "Initial Stock",
                    transaction_date: "2023-12-01T10:00:00.000Z", created_at: "2023-12-01T10:00:00.000Z"
                },
                {
                    transaction_id: 2, material_id: 2, material_name: "Copper Wire",
                    warehouse_id: warehouseId, warehouse_name: "Main Warehouse",
                    transaction_type: "OUT", quantity_change: -50,
                    reference_number: "ISS-20231205-001", reason_remarks: "Production Request",
                    transaction_date: "2023-12-05T14:30:00.000Z", created_at: "2023-12-05T14:30:00.000Z"
                }
            ];

            return {
                success: true,
                message: "Success",
                data: {
                    data: mockData,
                    meta: {
                        totalItems: 2, itemCount: 2, itemsPerPage: limit, totalPages: 1, currentPage: page
                    },
                    summary: {
                        total_in: 100, total_out: 50, net_change: 50
                    }
                }
            };
        }

        const response = await apiClient.get<ApiResponse<MovementHistoryResult>>(`/inventory/reports/movement-history?warehouse_id=${warehouseId}`);
        return response;
    }

    // Legacy support
    private async getInventoryLegacy(warehouseId: number, page: number = 1, limit: number = 10): Promise<ApiResponse<import('@/types/warehouse').MaterialInventory[]>> {
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
        const response = await apiClient.get<ApiResponse<import('@/types/warehouse').MaterialInventoryDTO[]>>(`/material-inventory?warehouse_id=${warehouseId}`);

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

    // --- Dashboard Stats ---
    // --- Dashboard Stats ---

    async getDashboardStats(): Promise<ApiResponse<import('@/types/warehouse').WarehouseDashboardStats>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: {
                    total_warehouses: 5,
                    active_warehouses: 5,
                    total_inventory_value: 1500000,
                    total_stock_items: 12500,
                    low_stock_alerts: 12,
                    utilization_rate: 78
                }
            };
        }
        const response = await apiClient.get<ApiResponse<import('@/types/warehouse').WarehouseDashboardStats>>(`${this.endpoint}/dashboard/stats`);
        return response;
    }

    async getDashboardDistribution(): Promise<ApiResponse<import('@/types/warehouse').WarehouseStockDistributionItem[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: [
                    { warehouse_name: "Main Warehouse", value: 800000, item_count: 5000, color: '#6366f1' },
                    { warehouse_name: "Cold Storage", value: 400000, item_count: 2000, color: '#f59e0b' },
                    { warehouse_name: "Chemical Store", value: 300000, item_count: 1500, color: '#10b981' }
                ]
            };
        }
        const response = await apiClient.get<ApiResponse<import('@/types/warehouse').WarehouseStockDistributionItem[]>>(`${this.endpoint}/dashboard/distribution`);
        return response;
    }

    async getDashboardUtilization(): Promise<ApiResponse<import('@/types/warehouse').WarehouseCapacityItem[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                success: true,
                message: "Success",
                data: [
                    { warehouse_name: "Main Warehouse", capacity: 10000, used: 8000, percentage: 80 },
                    { warehouse_name: "Cold Storage", capacity: 5000, used: 2000, percentage: 40 },
                    { warehouse_name: "Chemical Store", capacity: 4000, used: 2500, percentage: 62.5 }
                ]
            };
        }
        const response = await apiClient.get<ApiResponse<import('@/types/warehouse').WarehouseCapacityItem[]>>(`${this.endpoint}/dashboard/utilization`);
        return response;
    }

    // Deprecated
    async getStats(): Promise<import('@/types/warehouse').WarehouseStatsLegacy> {
        // This is kept only if other components rely on it, but we are rewriting the dashboard.
        // Returning mock wrapper that calls new methods locally if needed, but for now just mock return.
        if (MOCK_CONFIG.useMock) {
            return {
                totalWarehouses: 5,
                activeWarehouses: 5,
                totalValue: 1500000,
                totalItems: 12500,
                lowStockAlerts: 12,
                utilizationRate: 78,
                distribution: [],
                capacity: []
            };
        }
        return {} as any;
    }
}

export const warehouseService = new WarehouseService();
