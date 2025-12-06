import { Supplier } from "./suppliers";

export interface MaterialDTO {
    material_id: number;
    material_group_id: number;
    material_name: string;
    order_leadtime: number;
    container_type_id: number;
    quantity_per_container: number;
    unit_id: string;
    container_min_stock: number;
    container_max_stock: number;
    lifetime: number;
    lifetime_unit: string;
    active: number;
    supplier_id: number;
    update_date: string;
    cost_per_unit: number;
    expiration_date: string;
    container_type?: {
        type_id: number;
        type_name: string;
    };
    unit?: {
        unit_id: string;
        unit_name: string;
    };
    supplier?: {
        supplier_id: number;
        supplier_name: string;
        phone: string;
        email: string;
        address: string;
        active: number;
    };
    material_group?: {
        group_id: number;
        group_name: string;
    };
}

export interface Material {
    id: number;
    name: string;
    description?: string; // Optional as it's not in the new JSON
    sku: string; // Keeping for compatibility or generating from ID
    price: number;
    quantity: number;
    unit: string;
    minStockLevel: number;
    materialGroupId: number;
    containerTypeId: number;
    status: "active" | "inactive";
    imageUrl?: string;
    
    // New fields mapped
    orderLeadTime: number;
    containerMaxStock: number;
    lifetime: number;
    lifetimeUnit: string;
    supplierId: number;
    updateDate: string;
    expirationDate: string;

    // Relations
    materialGroup?: MaterialGroup;
    containerType?: ContainerType;
    supplier?: Supplier;
}

export interface MaterialGroup {
    id: number;
    name: string;
    description?: string;
}

export interface ContainerType {
    id: number;
    name: string;
    description?: string;
}

export interface CreateMaterialDTO {
    name: string;
    description?: string;
    sku: string;
    price: number;
    quantity: number;
    unit: string;
    minStockLevel: number;
    materialGroupId: number;
    containerTypeId: number;
    status: "active" | "inactive";
    imageUrl?: string;
}

export interface UpdateMaterialDTO extends Partial<CreateMaterialDTO> {}

export interface CreateMaterialGroupDTO {
    name: string;
    description: string;
}

export interface UpdateMaterialGroupDTO extends Partial<CreateMaterialGroupDTO> {}

export interface CreateContainerTypeDTO {
    name: string;
    description: string;
}

export interface UpdateContainerTypeDTO extends Partial<CreateContainerTypeDTO> {}
