
import { Material } from "./materials";

// Product Type
export interface ProductTypeDTO {
    product_type_id: number;
    type_name: string;
    description?: string;
    active: number;
    create_date: string;
    update_date: string;
    deleted_at?: string;
}

export interface ProductType {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface CreateProductTypeDTO {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateProductTypeDTO extends Partial<CreateProductTypeDTO> {}

// BOM (Bill of Materials)
export interface BomDTO {
    id: number;
    product_id: number;
    material_id: number;
    unit_id: number;
    usage_per_piece: number;
    version: number;
    active: number;
    scrap_factor: number;
    created_at: string;
    updated_at: string;
    
    // Relations (Mock/Expanded)
    material?: {
        material_id: number;
        material_name: string;
        cost_per_unit: number; 
    };
    unit?: {
        unit_id: number;
        unit_name: string;
    };
}

export interface BOM {
    id: number;
    productId: number;
    materialId: number;
    materialName?: string; // Derived
    unitId: number;
    unitName?: string; // Derived
    quantity: number; // usage_per_piece
    wastePercent: number; // scrap_factor
    version: number;
    isActive: boolean;
    costPerUnit?: number; // Derived from material
}

export interface CreateBomDTO {
    product_id: number;
    material_id: number;
    usage_per_piece: number;
    unit_id: number;
    version: number;
    active: number;
    scrap_factor: number;
}

export interface UpdateBomDTO extends Partial<CreateBomDTO> {}

// Product
export interface ProductDTO {
    product_id: number;
    product_name: string;
    product_type_id: number;
    active: number;
    create_date: string;
    update_date: string;
    deleted_at?: string;
    
    // Relations
    product_type?: ProductTypeDTO;
    boms?: BomDTO[];
}

export interface Product {
    id: number;
    name: string;
    typeId: number;
    typeName?: string;
    isActive: boolean;
    lastUpdated: string;
    
    // Relations
    bom: BOM[];
}

export interface CreateProductDTO {
    product_name: string;
    product_type_id: number;
    // Frontend might send BOMs during creation? 
    // Usually backend splits this, but for UI convenience we might handle it together or separate.
    // Based on backend DTO, it only accepts name and type_id. BOMs are likely created separately.
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface BOMItem {
    id: string;
    componentId: number;
    componentName: string;
    componentCode: string;
    quantity: number;
    unit: string;
    level: number;
    hasChildren: boolean;
    price?: number;
    children?: BOMItem[];
}

export interface BOMVersion {
    id: string;
    version: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
    description?: string;
    items: BOMItem[];
    createdAt: string;
    updatedAt: string;
}

export interface RoutingStep {
    id: string;
    sequence: number;
    name: string;
    workCenter: string;
    description?: string;
    setupTime: number; // minutes
    runTime: number; // minutes
    machine?: string;
}

export interface ProductSpec {
    id: string;
    parameter: string;
    targetValue: string;
    unit?: string;
    minTolerance?: string;
    maxTolerance?: string;
}

export interface ProductDocument {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
    size: string;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
    entity: string;
}
