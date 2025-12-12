
import { apiClient } from '@/lib/api/core/client';
import {
    Product,
    ProductDTO,
    CreateProductDTO,
    UpdateProductDTO,
    ProductType,
    ProductTypeDTO,
    CreateProductTypeDTO,
    UpdateProductTypeDTO,
    BOM,
    BomDTO,
    CreateBomDTO
} from '@/types/product';
import { ApiResponse } from '@/types/api';
import { MOCK_PRODUCTS, MOCK_PRODUCT_TYPES, MOCK_BOMS } from '@/lib/mock/products';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

// Mappers
const mapProductTypeDTOToDomain = (dto: ProductTypeDTO): ProductType => ({
    id: dto.product_type_id,
    name: dto.type_name,
    description: dto.description,
    isActive: dto.active === 1
});

const mapBomDTOToDomain = (dto: BomDTO): BOM => ({
    id: dto.id,
    productId: dto.product_id,
    materialId: dto.material_id,
    materialName: dto.material?.material_name || `Mat-${dto.material_id}`,
    unitId: dto.unit_id,
    unitName: dto.unit?.unit_name || `Unit-${dto.unit_id}`,
    quantity: Number(dto.usage_per_piece),
    wastePercent: Number(dto.scrap_factor),
    version: Number(dto.version),
    isActive: Boolean(dto.active),
    costPerUnit: Number(dto.material?.cost_per_unit || 0)
});

const mapProductDTOToDomain = (dto: ProductDTO): Product => ({
    id: dto.product_id,
    name: dto.product_name,
    typeId: dto.product_type_id,
    typeName: dto.product_type?.type_name || dto.type_name || "Unknown",
    isActive: dto.is_active !== undefined ? Boolean(dto.is_active) : Boolean(dto.active),
    lastUpdated: dto.update_date || dto.create_date,
    bom: (dto.boms || []).map(mapBomDTOToDomain)
});

class ProductService {
    private readonly endpoint = '/products';
    private readonly typeEndpoint = '/product-types';
    private readonly bomEndpoint = '/boms'; // Assuming standard pluralization, check if 'bom' or 'boms' in controller, defaulting to boms as typical

    // --- Products ---
    async getAll(page: number = 1, limit: number = 10, search: string = "", status: string = ""): Promise<ApiResponse<Product[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            let filtered = [...MOCK_PRODUCTS];
            if (search) {
                const lowerSearch = search.toLowerCase();
                filtered = filtered.filter(p => p.product_name.toLowerCase().includes(lowerSearch));
            }
            if (status && status !== "all") {
                const isActive = status === "active" ? 1 : 0;
                filtered = filtered.filter(p => p.active === isActive);
            }

            const start = (page - 1) * limit;
            const paginatedData = filtered.slice(start, start + limit);

            return {
                success: true,
                data: paginatedData.map(mapProductDTOToDomain),
                meta: {
                    totalItems: filtered.length,
                    itemCount: paginatedData.length,
                    itemsPerPage: limit,
                    totalPages: Math.ceil(filtered.length / limit),
                    currentPage: page
                }
            };
        }

        const is_active_param = status === "all" || status === "" ? "" : `&active=${status === "active" ? 1 : 0}`;
        const response = await apiClient.get<ApiResponse<ProductDTO[]> | ProductDTO[]>(`${this.endpoint}?page=${page}&limit=${limit}&search=${search}${is_active_param}`);

        let data: ProductDTO[] = [];
        let meta = {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: limit,
            totalPages: 1,
            currentPage: 1
        };

        if (Array.isArray(response)) {
            data = response;
            meta.totalItems = data.length;
            meta.itemCount = data.length;
            meta.itemsPerPage = data.length || limit;
        } else if (response.data) {
            data = response.data;
            if (response.meta) {
                meta = response.meta;
            } else {
                meta.totalItems = data.length;
                meta.itemCount = data.length;
                meta.itemsPerPage = data.length || limit;
            }
        }

        return {
            success: true,
            data: data.map(mapProductDTOToDomain),
            meta
        };
    }

    async getById(id: number): Promise<Product> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const product = MOCK_PRODUCTS.find(p => p.product_id === id);
            if (!product) throw new Error("Product not found");
            return mapProductDTOToDomain(product);
        }
        const response = await apiClient.get<ApiResponse<ProductDTO>>(`${this.endpoint}/${id}`);
        return mapProductDTOToDomain(response.data);
    }

    async create(data: CreateProductDTO): Promise<Product> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            // In a real mock we'd push to the array, but here we just return a stub
            return {
                id: Math.floor(Math.random() * 1000),
                name: data.product_name,
                typeId: data.product_type_id,
                typeName: "Mock Type",
                isActive: true,
                lastUpdated: new Date().toISOString(),
                bom: []
            };
        }
        const response = await apiClient.post<{ message: string, data: ProductDTO }>(this.endpoint, data);
        return mapProductDTOToDomain(response.data);
    }

    async update(id: number, data: UpdateProductDTO): Promise<Product> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                id,
                name: data.product_name || "Updated Name",
                typeId: data.product_type_id || 0,
                typeName: "Mock Type",
                isActive: true, // simplified
                lastUpdated: new Date().toISOString(),
                bom: []
            };
        }
        const response = await apiClient.put<{ message: string, data: ProductDTO }>(`${this.endpoint}/${id}`, data);
        return mapProductDTOToDomain(response.data);
    }

    async delete(id: number): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.delete(`${this.endpoint}/${id}`);
    }

    // --- Product Types ---
    async getTypes(): Promise<ProductType[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return MOCK_PRODUCT_TYPES.map(mapProductTypeDTOToDomain);
        }

        // Backend service might return array directly or wrapped
        const response = await apiClient.get<any>(this.typeEndpoint);
        let dtos: ProductTypeDTO[] = [];
        if (Array.isArray(response)) dtos = response;
        else if (Array.isArray(response.data)) dtos = response.data;

        return dtos.map(mapProductTypeDTOToDomain);
    }

    async getBomsByProduct(productId: number): Promise<BOM[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return MOCK_BOMS.filter(b => b.product_id === productId).map(mapBomDTOToDomain);
        }
        const response = await apiClient.get<ApiResponse<BomDTO[]>>(`${this.bomEndpoint}?product_id=${productId}`);
        // Handle array response if needed (API structure in user request suggests wrapping in 'data')
        // User request: { success: true, data: [...], ... }
        if (response.success && response.data) {
            return response.data.map(mapBomDTOToDomain);
        }
        return [];
    }

    // --- BOM Management ---
    async addBom(data: CreateBomDTO): Promise<BOM> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const newBom: BomDTO = {
                id: Math.random(),
                product_id: data.product_id,
                material_id: data.material_id,
                unit_id: data.unit_id,
                usage_per_piece: String(data.usage_per_piece),
                version: String(data.version),
                active: Boolean(data.active),
                scrap_factor: String(data.scrap_factor),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            return mapBomDTOToDomain(newBom);
        }
        const response = await apiClient.post<{ message: string, data: BomDTO }>(this.bomEndpoint, data);
        return mapBomDTOToDomain(response.data);
    }

    async deleteBom(id: number): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.delete(`${this.bomEndpoint}/${id}`);
    }

    // --- BOM Versions (Tree Structure) ---
    async getBOMVersions(productId: string): Promise<import('@/types/product').BOMVersion[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                {
                    id: "v1",
                    version: "1.0",
                    status: "approved",
                    description: "Initial BOM",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    items: [
                        {
                            id: "1",
                            componentId: 101,
                            componentName: "Main Board",
                            componentCode: "PCB-001",
                            quantity: 1,
                            unit: "pcs",
                            level: 1,
                            hasChildren: true,
                            price: 50,
                            children: [
                                {
                                    id: "1-1",
                                    componentId: 201,
                                    componentName: "Resistor",
                                    componentCode: "RES-10K",
                                    quantity: 10,
                                    unit: "pcs",
                                    level: 2,
                                    hasChildren: false,
                                    price: 0.1
                                }
                            ]
                        }
                    ]
                }
            ];
        }
        // Assuming a new endpoint for versions
        const response = await apiClient.get<ApiResponse<import('@/types/product').BOMVersion[]>>(`${this.endpoint}/${productId}/bom-versions`);
        return response.data;
    }

    async saveBOM(productId: string, bomVersion: import('@/types/product').BOMVersion): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.post(`${this.endpoint}/${productId}/bom-versions`, bomVersion);
    }

    // --- Routing ---
    async getRouting(productId: string): Promise<import('@/types/product').RoutingStep[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                { id: '1', sequence: 10, name: 'Cutting', workCenter: 'WC1', setupTime: 10, runTime: 5, description: 'Cut raw material' },
                { id: '2', sequence: 20, name: 'Assembly', workCenter: 'WC2', setupTime: 15, runTime: 30, description: 'Assemble parts' },
                { id: '3', sequence: 30, name: 'Quality Check', workCenter: 'QC', setupTime: 5, runTime: 10, description: 'Final inspection' },
            ];
        }
        const response = await apiClient.get<ApiResponse<import('@/types/product').RoutingStep[]>>(`${this.endpoint}/${productId}/routing`);
        return response.data;
    }

    async saveRouting(productId: string, steps: import('@/types/product').RoutingStep[]): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.put(`${this.endpoint}/${productId}/routing`, { steps });
    }

    // --- Specs ---
    async getSpecs(productId: string): Promise<import('@/types/product').ProductSpec[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                { id: '1', parameter: 'Material', targetValue: 'Aluminum', unit: '', minTolerance: '', maxTolerance: '' },
                { id: '2', parameter: 'Weight', targetValue: '1.5', unit: 'kg', minTolerance: '-0.1', maxTolerance: '+0.1' },
                { id: '3', parameter: 'Color', targetValue: 'Silver', unit: '', minTolerance: '', maxTolerance: '' },
            ];
        }
        const response = await apiClient.get<ApiResponse<import('@/types/product').ProductSpec[]>>(`${this.endpoint}/${productId}/specs`);
        return response.data;
    }

    async saveSpecs(productId: string, specs: import('@/types/product').ProductSpec[]): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.put(`${this.endpoint}/${productId}/specs`, { specs });
    }

    // --- Documents ---
    async getDocuments(productId: string): Promise<import('@/types/product').ProductDocument[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                { id: '1', name: 'Blueprint.pdf', type: 'PDF', size: '2.5 MB', uploadedBy: 'Admin', uploadedAt: new Date().toISOString(), url: '#' },
                { id: '2', name: 'AssemblyGuide.docx', type: 'DOCX', size: '1.2 MB', uploadedBy: 'Engineer', uploadedAt: new Date().toISOString(), url: '#' },
            ];
        }
        const response = await apiClient.get<ApiResponse<import('@/types/product').ProductDocument[]>>(`${this.endpoint}/${productId}/documents`);
        return response.data;
    }

    // --- Audit Log ---
    async getAuditLog(productId: string): Promise<import('@/types/product').AuditLogEntry[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                { id: '1', action: 'Created', user: 'Admin', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Product created', entity: 'Product' },
                { id: '2', action: 'Update BOM', user: 'Engineer', timestamp: new Date().toISOString(), details: 'Updated BOM v1.0', entity: 'BOM' },
            ];
        }
        const response = await apiClient.get<ApiResponse<import('@/types/product').AuditLogEntry[]>>(`${this.endpoint}/${productId}/audit-log`);
        return response.data;
    }

    // --- Dashboard Stats ---
    async getStats(): Promise<import('@/types/product').ProductStats> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            // Count from mock data
            const total = MOCK_PRODUCTS.length;
            const active = MOCK_PRODUCTS.filter(p => p.active).length;

            // Mock distribution
            const typeCounts: Record<string, number> = {};
            MOCK_PRODUCTS.forEach(p => {
                const typeName = p.product_type?.type_name || "Unknown";
                typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
            });
            const distribution = Object.entries(typeCounts).map(([name, count]) => ({
                name,
                value: count,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color for mock
            }));

            return {
                totalProducts: total,
                activeProducts: active,
                newThisMonth: 5, // mock
                avgCost: 1500, // mock
                distribution,
                costTrends: [
                    { name: "Jan", value: 1400 },
                    { name: "Feb", value: 1450 },
                    { name: "Mar", value: 1420 },
                    { name: "Apr", value: 1500 },
                    { name: "May", value: 1550 },
                    { name: "Jun", value: 1600 }
                ]
            };
        }

        try {
            const response = await apiClient.get<ApiResponse<import('@/types/product').ProductStats>>(`${this.endpoint}/dashboard/stats`);
            return response.data;
        } catch (error) {
            console.warn("API failed, falling back to mock stats", error);
            // Fallback mock
            return {
                totalProducts: 0,
                activeProducts: 0,
                newThisMonth: 0,
                avgCost: 0,
                distribution: [],
                costTrends: []
            };
        }
    }
}

class ProductTypeService {
    private readonly endpoint = '/product-types';

    async getAll(page: number = 1, limit: number = 10, search: string = "", status: string = "all"): Promise<ApiResponse<ProductType[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            let filtered = [...MOCK_PRODUCT_TYPES];

            if (search) {
                const lowerSearch = search.toLowerCase();
                filtered = filtered.filter(t => t.type_name.toLowerCase().includes(lowerSearch));
            }
            if (status !== "all") {
                const isActive = status === "active" ? 1 : 0;
                filtered = filtered.filter(t => t.active === isActive);
            }

            const start = (page - 1) * limit;
            const paginatedData = filtered.slice(start, start + limit);

            return {
                success: true,
                data: paginatedData.map(mapProductTypeDTOToDomain),
                meta: {
                    totalItems: filtered.length,
                    itemCount: paginatedData.length,
                    itemsPerPage: limit,
                    totalPages: Math.ceil(filtered.length / limit),
                    currentPage: page
                }
            };
        }

        const is_active_param = status === "all" || status === "" ? "" : `&active=${status === "active" ? 1 : 0}`;
        // Assuming backend supports pagination for product-types now
        // const response = await apiClient.get<ApiResponse<ProductTypeDTO[]>>(`${this.endpoint}?page=${page}&limit=${limit}&search=${search}${is_active_param}`);
        const response = await apiClient.get<ApiResponse<ProductTypeDTO[]>>(`${this.endpoint}`);

        // Handle case where backend might return array directly (legacy compat) vs ApiResponse
        if (Array.isArray(response)) {
            // Fallback if backend doesn't support pagination yet but we want to avoid breaking
            const dtos = response as ProductTypeDTO[];
            return {
                success: true,
                data: dtos.map(mapProductTypeDTOToDomain),
                meta: {
                    totalItems: dtos.length,
                    itemCount: dtos.length,
                    itemsPerPage: dtos.length,
                    totalPages: 1,
                    currentPage: 1
                }
            };
        }

        return {
            ...response,
            data: response.data.map(mapProductTypeDTOToDomain)
        };
    }

    async create(data: CreateProductTypeDTO): Promise<ProductType> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const newType: ProductTypeDTO = {
                product_type_id: Math.floor(Math.random() * 1000),
                type_name: data.name,
                active: data.isActive === false ? 0 : 1,
                create_date: new Date().toISOString(),
                update_date: new Date().toISOString()
            };
            return mapProductTypeDTOToDomain(newType);
        }

        // Map domain DTO to backend DTO
        const payload = {
            type_name: data.name,
        };

        const response = await apiClient.post<{ message: string, data: ProductTypeDTO }>(this.endpoint, payload);
        return mapProductTypeDTOToDomain(response.data);
    }

    async update(id: number, data: UpdateProductTypeDTO): Promise<ProductType> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const existing = MOCK_PRODUCT_TYPES.find(t => t.product_type_id === id);
            if (!existing) throw new Error("Product Type not found");

            // Mock update
            const updated: ProductTypeDTO = {
                ...existing,
                type_name: data.name || existing.type_name,
                active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : existing.active,
                update_date: new Date().toISOString()
            };

            return mapProductTypeDTOToDomain(updated);
        }

        const payload: any = {};
        if (data.name) payload.type_name = data.name;
        if (data.isActive !== undefined) payload.active = data.isActive ? 1 : 0;

        const response = await apiClient.put<{ message: string, data: ProductTypeDTO }>(`${this.endpoint}/${id}`, payload);
        return mapProductTypeDTOToDomain(response.data);
    }

    async delete(id: number): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.delete(`${this.endpoint}/${id}`);
    }
}

export const productService = new ProductService();
export const productTypeService = new ProductTypeService();
