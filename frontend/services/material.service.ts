import { apiClient } from '@/lib/api/core/client';
import { 
    Material, 
    CreateMaterialDTO, 
    UpdateMaterialDTO,
    MaterialGroup,
    MaterialGroupDTO,
    CreateMaterialGroupDTO,
    UpdateMaterialGroupDTO,
    ContainerType,
    ContainerTypeDTO,
    CreateContainerTypeDTO,
    UpdateContainerTypeDTO,
    MaterialDTO,
    MaterialUnit,
    MaterialUnitDTO
} from '@/types/materials';
import { ApiResponse } from '@/types/api';
import { MOCK_MATERIALS_DATA, MOCK_MATERIAL_GROUPS, MOCK_CONTAINER_TYPES } from '@/lib/mock/materials';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

interface ApiResult<T> {
    message: string;
    data: T;
}

// Helper to map DTO to Domain Model
const mapMaterialDTOToDomain = (dto: MaterialDTO): Material => {
    return {
        id: dto.material_id,
        name: dto.material_name,
        description: "", 
        sku: `MAT-${dto.material_id}`,
        price: dto.cost_per_unit || 0,
        quantity: dto.quantity_per_container || 0,
        unit: dto.unit?.unit_name || "Unknown",
        unitId: dto.unit_id,
        minStockLevel: dto.container_min_stock || 0,
        materialGroupId: dto.material_group_id,
        containerTypeId: dto.container_type_id,
        status: dto.is_active === true ? "active" : "inactive",
        is_active: dto.is_active,
        imageUrl: "",
        
        orderLeadTime: dto.order_leadtime || 0,
        containerMaxStock: dto.container_max_stock || 0,
        lifetime: dto.lifetime || 0,
        lifetimeUnit: dto.lifetime_unit || "",
        supplierId: dto.supplier_id,
        updateDate: dto.update_date,
        expirationDate: dto.expiration_date,

        materialGroup: dto.material_group ? {
            id: dto.material_group.group_id,
            name: dto.material_group.group_name,
            abbreviation: dto.material_group.abbreviation
        } : undefined,
        containerType: dto.container_type ? {
            id: dto.container_type.type_id,
            name: dto.container_type.type_name
        } : undefined,
        supplier: dto.supplier ? {
            id: dto.supplier.supplier_id,
            name: dto.supplier.supplier_name || 'N/A',
            email: dto.supplier.email || '',
            phone: dto.supplier.phone || '',
            address: dto.supplier.address || '',
            status: dto.supplier.is_active ? "active" : "inactive",
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
             // Mock filtering logic can be added here if needed
             const start = (page - 1) * limit;
             const paginatedData = filtered.slice(start, start + limit);
             return {
                 success: true,
                 data: paginatedData.map(mapMaterialDTOToDomain),
                 meta: { totalItems: filtered.length, itemCount: paginatedData.length, itemsPerPage: limit, totalPages: Math.ceil(filtered.length/limit), currentPage: page }
             };
        }
        
        // Backend returns standard pagination structure: { data: [], meta: {} }
        // The DTO from backend is MaterialDTO[]
        const is_active_filter = status === "" || status === "all" ? '' :  `&is_active=${status}` ;
        const response = await apiClient.get<ApiResponse<MaterialDTO[]>>(`${this.endpoint}?page=${page}&limit=${limit}&search=${search}${is_active_filter}`);
        
        return {
            ...response,
            data: response.data.map(mapMaterialDTOToDomain)
        };
    }

    async getById(id: number | string): Promise<Material> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const materialDTO = MOCK_MATERIALS_DATA.find(m => m.material_id === Number(id));
            if (!materialDTO) throw new Error("Material not found");
            return mapMaterialDTOToDomain(materialDTO);
        }
        // Backend returns MaterialMaster directly
        const response = await apiClient.get<MaterialDTO>(`${this.endpoint}/${id}`); 
        console.log(response);
        return mapMaterialDTOToDomain(response.data);
    }

    async create(data: CreateMaterialDTO): Promise<Material> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
             // Mock creation not fully implemented for state persistence in this snippet
             return {} as Material;
        }
        // Backend returns { message, data }
        const response = await apiClient.post<ApiResult<MaterialDTO>>(this.endpoint, data);
        return mapMaterialDTOToDomain(response.data);
    }

    async update(id: number | string, data: UpdateMaterialDTO): Promise<Material> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
             return {} as Material;
        }
        const response = await apiClient.put<ApiResult<MaterialDTO>>(`${this.endpoint}/${id}`, data);
        return mapMaterialDTOToDomain(response.data);
    }

    async delete(id: number | string): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

// Material Group Service
class MaterialGroupService {
    private readonly endpoint = '/material-groups';

    async getAll(): Promise<MaterialGroup[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return MOCK_MATERIAL_GROUPS.map(g => ({ id: g.group_id, name: g.group_name, abbreviation: g.abbreviation }));
        }
        const response = await apiClient.get<any>(this.endpoint);
        let dtos: MaterialGroupDTO[] = [];
        if (response.data && Array.isArray(response.data)) dtos = response.data;
        else if (Array.isArray(response)) dtos = response;
        
        return dtos.map(dto => ({
            id: dto.group_id,
            name: dto.group_name,
            abbreviation: dto.abbreviation
        }));
    }
    
    async create(data: CreateMaterialGroupDTO): Promise<MaterialGroup> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return { id: Math.random(), name: data.group_name, abbreviation: data.abbreviation };
        }
        const response = await apiClient.post<ApiResult<MaterialGroupDTO>>(this.endpoint, data);
        return { 
            id: response.data.group_id, 
            name: response.data.group_name,
            abbreviation: response.data.abbreviation
        };
    }

    async update(id: number, data: UpdateMaterialGroupDTO): Promise<MaterialGroup> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return { id, name: data.group_name || "", abbreviation: data.abbreviation || "" };
        }
        const response = await apiClient.put<ApiResult<MaterialGroupDTO>>(`${this.endpoint}/${id}`, data);
        return { 
            id: response.data.group_id, 
            name: response.data.group_name,
            abbreviation: response.data.abbreviation
        };
    }

    async delete(id: number): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

// Container Type Service
class ContainerTypeService {
    private readonly endpoint = '/container-types';

    async getAll(): Promise<ContainerType[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return MOCK_CONTAINER_TYPES.map(c => ({ id: c.type_id, name: c.type_name }));
        }
        const response = await apiClient.get<any>(this.endpoint);
        let dtos: ContainerTypeDTO[] = [];
        if (response.data && Array.isArray(response.data)) dtos = response.data;
        else if (Array.isArray(response)) dtos = response;
        
        return dtos.map(dto => ({
            id: dto.type_id,
            name: dto.type_name
        }));
    }
    
    async create(data: CreateContainerTypeDTO): Promise<ContainerType> {
        if (MOCK_CONFIG.useMock) {
             await simulateDelay();
             return { id: Math.random(), name: data.type_name };
        }
        const response = await apiClient.post<ApiResult<ContainerTypeDTO>>(this.endpoint, data);
        return { id: response.data.type_id, name: response.data.type_name };
    }

    async update(id: number, data: UpdateContainerTypeDTO): Promise<ContainerType> {
        if (MOCK_CONFIG.useMock) {
             await simulateDelay();
             return { id, name: data.type_name || "" };
        }
        const response = await apiClient.put<ApiResult<ContainerTypeDTO>>(`${this.endpoint}/${id}`, data);
        return { id: response.data.type_id, name: response.data.type_name };
    }

    async delete(id: number): Promise<void> {
        if (MOCK_CONFIG.useMock) {
             await simulateDelay();
             return;
        }
        await apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

// Material Unit Service
class MaterialUnitService {
    private readonly endpoint = '/units'; 

    async getAll(): Promise<MaterialUnit[]> {
        const response = await apiClient.get<any>(this.endpoint); 
        let dtos: MaterialUnitDTO[] = [];
        if (response.data && Array.isArray(response.data)) dtos = response.data;
        else if (Array.isArray(response)) dtos = response;

        return dtos.map(dto => ({
            id: dto.unit_id,
            name: dto.unit_name
        }));
    }

    async create(data: { unit_name: string }): Promise<MaterialUnit> {
        const response = await apiClient.post<ApiResult<MaterialUnitDTO>>(this.endpoint, data);
        return { id: response.data.unit_id, name: response.data.unit_name };
    }

    async update(id: number, data: { unit_name: string }): Promise<MaterialUnit> {
        const response = await apiClient.put<ApiResult<MaterialUnitDTO>>(`${this.endpoint}/${id}`, data);
        return { id: response.data.unit_id, name: response.data.unit_name };
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

export const materialService = new MaterialService();
export const materialGroupService = new MaterialGroupService();
export const containerTypeService = new ContainerTypeService();
export const materialUnitService = new MaterialUnitService();
