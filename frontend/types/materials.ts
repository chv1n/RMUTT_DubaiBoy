export interface ContainerType {
    id: number;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MaterialGroup {
    id: number;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Material {
    id: number;
    name: string;
    description?: string;
    sku: string;
    price: number;
    quantity: number;
    unit: string;
    minStockLevel: number;
    imageUrl?: string;
    materialGroupId: number;
    materialGroup?: MaterialGroup;
    containerTypeId: number;
    containerType?: ContainerType;
    status: 'active' | 'inactive' | 'out_of_stock';
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateMaterialDTO extends Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'materialGroup' | 'containerType'> {}
export interface UpdateMaterialDTO extends Partial<CreateMaterialDTO> {}

export interface CreateMaterialGroupDTO extends Omit<MaterialGroup, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateMaterialGroupDTO extends Partial<CreateMaterialGroupDTO> {}

export interface CreateContainerTypeDTO extends Omit<ContainerType, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateContainerTypeDTO extends Partial<CreateContainerTypeDTO> {}
