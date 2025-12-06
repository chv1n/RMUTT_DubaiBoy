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
    UpdateContainerTypeDTO
} from '@/types/materials';

// Material Service
class MaterialService {
    private readonly endpoint = '/materials';

    async getAll(): Promise<Material[]> {
        return apiClient.get<Material[]>(this.endpoint);
    }

    async getById(id: number | string): Promise<Material> {
        return apiClient.get<Material>(`${this.endpoint}/${id}`);
    }

    async create(data: CreateMaterialDTO): Promise<Material> {
        return apiClient.post<Material>(this.endpoint, data);
    }

    async update(id: number | string, data: UpdateMaterialDTO): Promise<Material> {
        return apiClient.put<Material>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number | string): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

// Material Group Service
class MaterialGroupService {
    private readonly endpoint = '/material-groups';

    async getAll(): Promise<MaterialGroup[]> {
        return apiClient.get<MaterialGroup[]>(this.endpoint);
    }

    async getById(id: number | string): Promise<MaterialGroup> {
        return apiClient.get<MaterialGroup>(`${this.endpoint}/${id}`);
    }

    async create(data: CreateMaterialGroupDTO): Promise<MaterialGroup> {
        return apiClient.post<MaterialGroup>(this.endpoint, data);
    }

    async update(id: number | string, data: UpdateMaterialGroupDTO): Promise<MaterialGroup> {
        return apiClient.put<MaterialGroup>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number | string): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

// Container Type Service
class ContainerTypeService {
    private readonly endpoint = '/container-types';

    async getAll(): Promise<ContainerType[]> {
        return apiClient.get<ContainerType[]>(this.endpoint);
    }

    async getById(id: number | string): Promise<ContainerType> {
        return apiClient.get<ContainerType>(`${this.endpoint}/${id}`);
    }

    async create(data: CreateContainerTypeDTO): Promise<ContainerType> {
        return apiClient.post<ContainerType>(this.endpoint, data);
    }

    async update(id: number | string, data: UpdateContainerTypeDTO): Promise<ContainerType> {
        return apiClient.put<ContainerType>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number | string): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

export const materialService = new MaterialService();
export const materialGroupService = new MaterialGroupService();
export const containerTypeService = new ContainerTypeService();
