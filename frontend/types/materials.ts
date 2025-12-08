import { SupplierDTO } from "./suppliers";

export interface MaterialDTO {
    material_id: number;
    material_group_id: number | null;
    material_name: string;
    order_leadtime: number | null;
    container_type_id: number | null;
    quantity_per_container: number | null; // Quantity per container in 'unit_id' units
    unit_id: number | null;
    container_min_stock: number | null;
    container_max_stock: number | null;
    lifetime: number | null;
    lifetime_unit: string | null;
    active: number;
    supplier_id: number | null;
    update_date: string; // ISO date string
    cost_per_unit: number | null;
    expiration_date: string | null; // ISO date string
    
    // Relations
    material_group?: MaterialGroupDTO;
    container_type?: ContainerTypeDTO;
    unit?: MaterialUnitDTO;
    supplier?: SupplierDTO;
}

export interface Material {
    id: number;
    name: string;
    description: string;
    sku: string;
    price: number;
    quantity: number; // Linked to quantity_per_container
    unit: string; 
    unitId: number | null;
    minStockLevel: number;
    materialGroupId: number | null;
    containerTypeId: number | null;
    status: "active" | "inactive";
    imageUrl: string; 
    
    orderLeadTime: number;
    containerMaxStock: number;
    lifetime: number;
    lifetimeUnit: string;
    supplierId: number | null;
    updateDate: string;
    expirationDate: string | null;

    // Nested Objects
    materialGroup?: MaterialGroup;
    containerType?: ContainerType;
    supplier?: {
        id: number;
        name: string;
        email: string;
        phone: string;
        address: string;
        status: string;
    };
}

export interface MaterialGroupDTO {
    group_id: number;
    group_name: string;
    abbreviation: string;
    create_at?: string;
    delete_at?: string | null;
}

export interface MaterialGroup {
    group_id: Key | null | undefined;
    group_name: ReactNode;
    id: number;
    name: string;
    abbreviation: string;
}

export interface ContainerTypeDTO {
    type_id: number;
    type_name: string;
    create_at?: string;
}

export interface ContainerType {
    type_id: Key | null | undefined;
    type_name: ReactNode;
    id: number;
    name: string;
}

export interface MaterialUnitDTO {
    unit_id: number;
    unit_name: string;
    create_at?: string;
    deleted_at?: string | null;
}

export interface MaterialUnit {
    unit_id: Key | null | undefined;
    unit_name: ReactNode;
    id: number;
    name: string;
}

export interface CreateMaterialDTO {
    material_name: string;
    material_group_id?: number | null;
    order_leadtime?: number | null;
    container_type_id?: number | null;
    quantity_per_container?: number | null;
    unit_id?: string | number | null; // Updated to allow string as per user request (e.g. "KG")
    container_min_stock?: number | null;
    container_max_stock?: number | null;
    lifetime?: number | null;
    lifetime_unit?: string | null;
    supplier_id?: number | null;
    cost_per_unit?: number | null;
    expiration_date?: string | null;
    is_active?: boolean;
}

export interface UpdateMaterialDTO extends Partial<CreateMaterialDTO> {}

export interface CreateMaterialGroupDTO {
    group_name: string;
    abbreviation: string;
}

export interface UpdateMaterialGroupDTO extends Partial<CreateMaterialGroupDTO> {}

export interface CreateContainerTypeDTO {
    type_name: string;
}

export interface UpdateContainerTypeDTO extends Partial<CreateContainerTypeDTO> {}

export interface CreateMaterialUnitDTO {
    unit_name: string;
}

export interface UpdateMaterialUnitDTO extends Partial<CreateMaterialUnitDTO> {}
