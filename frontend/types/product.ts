import { Material } from "./materials";

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface Product extends Material {
    // Product specific fields (mocked or derived)
    category: string;
    lastUpdated: string;
    versions: string[];
    defaultVersion: string;
    
    // Mock fields for UI
    isApproved: boolean;
}

export interface BOMItem {
    id: string; // unique link id
    componentId: number; // material_id
    componentName: string;
    componentCode: string; // sku
    quantity: number;
    unit: string;
    level: number;
    hasChildren: boolean;
    children?: BOMItem[];
    price?: number; // for costing
}

export interface BOMVersion {
    id: string;
    version: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    description: string;
    effectiveDate: string;
    items: BOMItem[];
    createdAt: string;
    createdBy: string;
}

export interface RoutingStep {
    id: string;
    sequence: number;
    name: string;
    description: string;
    workCenter: string;
    setupTime: number; // minutes
    runTime: number; // minutes per unit
    machine?: string;
}

export interface ProductSpec {
    id: string;
    parameter: string;
    targetValue: string;
    unit: string;
    minTolerance?: string;
    maxTolerance?: string;
    method?: string;
}

export interface ProductDocument {
    id: string;
    name: string;
    type: 'pdf' | 'cad' | 'image' | 'other';
    url: string;
    uploadDate: string;
    size: string;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
    oldValue?: string;
    newValue?: string;
}

export interface ImportMapping {
    fileColumn: string;
    systemField: string;
    sampleValue?: string;
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
}

export interface UpdateProductTypeDTO extends Partial<CreateProductTypeDTO> {
    isActive?: boolean;
}

export interface ProductTypeDTO {
    ProductTypeID: number;
    TypeName: string;
    Active: number;
    UpdateDate: string;
}

export interface CreateProductDTO {
    // ... define based on Product/Material creation needs if separate
    name: string;
    sku: string;
    // ...
}
