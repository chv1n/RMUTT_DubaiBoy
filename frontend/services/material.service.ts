import { apiClient } from '@/lib/api/core/client';
import { 
    Material, 
    CreateMaterialDTO, 
    UpdateMaterialDTO,
    MaterialGroup,
    CreateMaterialGroupDTO,
    UpdateMaterialGroupDTO,
    ContainerType,
    CreateContainerTypeDTO,
    UpdateContainerTypeDTO,
    MaterialDTO
} from '@/types/materials';
import { ApiResponse } from '@/types/api';
import { MOCK_MATERIALS_DATA, MOCK_MATERIAL_GROUPS, MOCK_CONTAINER_TYPES } from '@/lib/mock/materials';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

// Helper to map DTO to Domain Model
const mapMaterialDTOToDomain = (dto: MaterialDTO): Material => {
    return {
        id: dto.material_id,
        name: dto.material_name,
        description: "", // Not in DTO
        sku: `MAT-${dto.material_id}`, // Generated
        price: dto.cost_per_unit,
        quantity: dto.quantity_per_container, // Mapping quantity per container as main quantity for now
        unit: dto.unit_id,
        minStockLevel: dto.container_min_stock,
        materialGroupId: dto.material_group_id,
        containerTypeId: dto.container_type_id,
        status: dto.active === 1 ? "active" : "inactive",
        imageUrl: "",
        
        orderLeadTime: dto.order_leadtime,
        containerMaxStock: dto.container_max_stock,
        lifetime: dto.lifetime,
        lifetimeUnit: dto.lifetime_unit,
        supplierId: dto.supplier_id,
        updateDate: dto.update_date,
        expirationDate: dto.expiration_date,

        materialGroup: dto.material_group ? {
            id: dto.material_group.group_id,
            name: dto.material_group.group_name
        } : undefined,
        containerType: dto.container_type ? {
            id: dto.container_type.type_id,
            name: dto.container_type.type_name
        } : undefined,
        supplier: dto.supplier ? {
            id: dto.supplier.supplier_id,
            name: dto.supplier.supplier_name,
            email: dto.supplier.email,
            phone: dto.supplier.phone,
            address: dto.supplier.address,
            status: dto.supplier.active === 1 ? "active" : "inactive",
            rating: 5, // Default
            totalSpent: 0, // Default
            totalOrders: 0, // Default
            lastOrderDate: "", // Default
            category: "", // Default
            paymentTerms: "", // Default
            contactPerson: "" // Default
        } : undefined
    };
};

// Material Service
class MaterialService {
    private readonly endpoint = '/materials';

    async getAll(page: number = 1, limit: number = 10, search: string = "", status: string = "all"): Promise<ApiResponse<Material[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            
            let filtered = [...MOCK_MATERIALS_DATA];

            // Filter by search
            if (search) {
                const lowerSearch = search.toLowerCase();
                filtered = filtered.filter(m => 
                    m.material_name.toLowerCase().includes(lowerSearch)
                );
            }

            // Filter by status
            if (status !== "all") {
                const isActive = status === "active" ? 1 : 0;
                filtered = filtered.filter(m => m.active === isActive);
            }

            // Pagination
            const totalItems = filtered.length;
            const totalPages = Math.ceil(totalItems / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginatedData = filtered.slice(start, end);

            return {
                success: true,
                data: paginatedData.map(mapMaterialDTOToDomain),
                meta: {
                    totalItems,
                    itemCount: paginatedData.length,
                    itemsPerPage: limit,
                    totalPages,
                    currentPage: page
                }
            };
        }
        return apiClient.get<ApiResponse<Material[]>>(`${this.endpoint}?page=${page}&limit=${limit}&search=${search}&status=${status}`);
    }

    async getById(id: number | string): Promise<Material> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const materialDTO = MOCK_MATERIALS_DATA.find(m => m.material_id === Number(id));
            if (!materialDTO) throw new Error("Material not found");
            return mapMaterialDTOToDomain(materialDTO);
        }
        const response = await apiClient.get<ApiResponse<Material>>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async create(data: CreateMaterialDTO): Promise<Material> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            // In a real mock, we'd convert Domain DTO back to Backend DTO and push to MOCK_MATERIALS_DATA
            // For simplicity, we just return the domain object as if created
            const newMaterial: Material = {
                ...data,
                id: Math.floor(Math.random() * 1000) + 1000,
                orderLeadTime: 0,
                containerMaxStock: 0,
                lifetime: 0,
                lifetimeUnit: "",
                supplierId: 0,
                updateDate: new Date().toISOString(),
                expirationDate: ""
            };
            return newMaterial;
        }
        const response = await apiClient.post<ApiResponse<Material>>(this.endpoint, data);
        return response.data;
    }

    async update(id: number | string, data: UpdateMaterialDTO): Promise<Material> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            // Simulate update
            return {
                ...data,
                id: Number(id),
            } as Material;
        }
        const response = await apiClient.put<ApiResponse<Material>>(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    async delete(id: number | string): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const index = MOCK_MATERIALS_DATA.findIndex(m => m.material_id === Number(id));
            if (index !== -1) {
                MOCK_MATERIALS_DATA.splice(index, 1);
            }
            return;
        }
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

// Material Group Service (Kept simple for now)
class MaterialGroupService {
    private readonly endpoint = '/material-groups';

    async getAll(): Promise<MaterialGroup[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [...MOCK_MATERIAL_GROUPS];
        }
        return apiClient.get<MaterialGroup[]>(this.endpoint);
    }
    // ... other methods kept same or simplified
    async create(data: CreateMaterialGroupDTO): Promise<MaterialGroup> { return {} as any; }
    async update(id: number | string, data: UpdateMaterialGroupDTO): Promise<MaterialGroup> { return {} as any; }
    async delete(id: number | string): Promise<void> { }
}

// Container Type Service (Kept simple for now)
class ContainerTypeService {
    private readonly endpoint = '/container-types';

    async getAll(): Promise<ContainerType[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [...MOCK_CONTAINER_TYPES];
        }
        return apiClient.get<ContainerType[]>(this.endpoint);
    }
    // ... other methods kept same or simplified
    async create(data: CreateContainerTypeDTO): Promise<ContainerType> { return {} as any; }
    async update(id: number | string, data: UpdateContainerTypeDTO): Promise<ContainerType> { return {} as any; }
    async delete(id: number | string): Promise<void> { }
}

export const materialService = new MaterialService();
export const materialGroupService = new MaterialGroupService();
export const containerTypeService = new ContainerTypeService();
