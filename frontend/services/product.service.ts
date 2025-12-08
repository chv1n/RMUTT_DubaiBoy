import { apiClient } from '@/lib/api/core/client';
import { Product, BOMVersion, RoutingStep, ProductSpec, ProductDocument, AuditLogEntry, ProductType, CreateProductTypeDTO, UpdateProductTypeDTO } from '@/types/product';
import { MaterialDTO } from '@/types/materials';
import { ApiResponse } from '@/types/api';

// Assuming Product extends Material, we reuse Material mapping logic or create new one
const mapProductFromMaterialDTO = (dto: MaterialDTO): Product => {
    return {
        id: dto.material_id,
        name: dto.material_name,
        description: "",
        sku: `PRD-${dto.material_id}`, // Prefix changed to PRD for products
        price: dto.cost_per_unit || 0,
        quantity: dto.quantity_per_container || 0,
        unit: dto.unit?.unit_name || "Unknown",
        unitId: dto.unit_id,
        minStockLevel: dto.container_min_stock || 0,
        materialGroupId: dto.material_group_id,
        containerTypeId: dto.container_type_id,
        status: dto.active === 1 ? "active" : "inactive",
        imageUrl: "",
        orderLeadTime: dto.order_leadtime || 0,
        containerMaxStock: dto.container_max_stock || 0,
        lifetime: dto.lifetime || 0,
        lifetimeUnit: dto.lifetime_unit || "",
        supplierId: dto.supplier_id,
        updateDate: dto.update_date,
        expirationDate: dto.expiration_date,
        
        // Product specific (Mocked)
        category: dto.material_group?.group_name || 'General',
        lastUpdated: dto.update_date,
        versions: ['v1.0', 'v1.1'],
        defaultVersion: 'v1.1',
        isApproved: true,

        materialGroup: dto.material_group ? {
            id: dto.material_group.group_id,
            name: dto.material_group.group_name,
            abbreviation: dto.material_group.abbreviation,
            group_id: dto.material_group.group_id,
            group_name: dto.material_group.group_name
        } : undefined,
    };
};

import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';
import { MOCK_PRODUCTS, MOCK_PRODUCT_TYPES } from '@/lib/mock/products';

// ... (Previous imports)

class ProductService {
    private readonly endpoint = '/products';

    // Fetch products
    async getProducts(page: number = 1, limit: number = 10, search: string = "", status: string = ""): Promise<ApiResponse<Product[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const filtered = MOCK_PRODUCTS.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) || 
                p.sku.toLowerCase().includes(search.toLowerCase())
            );
            
            const start = (page - 1) * limit;
            const paginatedData = filtered.slice(start, start + limit);
            return {
                success: true,
                data: paginatedData,
                meta: { totalItems: filtered.length, itemCount: paginatedData.length, itemsPerPage: limit, totalPages: Math.ceil(filtered.length/limit), currentPage: page }
            };
        }
        const response = await apiClient.get<ApiResponse<MaterialDTO[]>>(`${this.endpoint}?page=${page}&limit=${limit}&search=${search}&status=${status}`);
        
        return {
            ...response,
            data: response.data.map(mapProductFromMaterialDTO)
        };
    }

    async getProduct(id: number | string): Promise<Product> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const numericId = Number(id);
            if (isNaN(numericId)) {
                throw new Error(`Invalid Product ID: ${id}`);
            }
            const product = MOCK_PRODUCTS.find(p => p.id === numericId);
            if (!product) throw new Error(`Product not found with ID: ${id}`);
            return product;
        }
        const response = await apiClient.get<MaterialDTO>(`${this.endpoint}/${id}`);
        return mapProductFromMaterialDTO(response);
    }
    
    async createProduct(data: any): Promise<Product> {
        // Mock create
        if (MOCK_CONFIG.useMock) {
             await simulateDelay();
             return { ...MOCK_PRODUCTS[0], ...data, id: Math.random() };
        }
        const response = await apiClient.post<any>(this.endpoint, data);
        return mapProductFromMaterialDTO(response.data);
    }

    async updateProduct(id: number | string, data: any): Promise<Product> {
         if (MOCK_CONFIG.useMock) {
             await simulateDelay();
             return { ...MOCK_PRODUCTS.find(p => p.id === Number(id))!, ...data };
        }
        const response = await apiClient.put<any>(`${this.endpoint}/${id}`, data);
        return mapProductFromMaterialDTO(response.data);
    }

    async deleteProduct(id: number | string): Promise<void> {
        if (MOCK_CONFIG.useMock) {
             await simulateDelay();
             const index = MOCK_PRODUCTS.findIndex(p => p.id === Number(id));
             if (index !== -1) {
                 MOCK_PRODUCTS.splice(index, 1);
             }
             return;
        }
        await apiClient.delete(`${this.endpoint}/${id}`);
    }

    async bulkApprove(ids: (number | string)[]): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            ids.forEach(id => {
                const product = MOCK_PRODUCTS.find(p => p.id === Number(id));
                if (product) product.status = "active";
            });
            return;
        }
        await apiClient.post(`${this.endpoint}/bulk-approve`, { ids });
    }

    async bulkArchive(ids: (number | string)[]): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            ids.forEach(id => {
                const product = MOCK_PRODUCTS.find(p => p.id === Number(id));
                if (product) product.status = "inactive";
            });
            return;
        }
        await apiClient.post(`${this.endpoint}/bulk-archive`, { ids });
    }

    // ... (Mocked sub-features remain same)
    // --- MOCKED SUB-FEATURE METHODS ---

    async getBOMVersions(productId: string): Promise<BOMVersion[]> {
        await simulateDelay(); // Ensure delay for consistency
        // Mock data
        return [
            {
                id: 'bom-v1',
                version: '1.0',
                status: 'approved',
                description: 'Initial Release',
                effectiveDate: '2023-01-01',
                createdAt: '2022-12-01',
                createdBy: 'System Admin',
                items: [
                    { id: '1', componentId: 101, componentCode: 'RAW-001', componentName: 'Steel Sheet', quantity: 2, unit: 'pcs', level: 1, hasChildren: false },
                    { id: '2', componentId: 102, componentCode: 'RAW-002', componentName: 'Screw M4', quantity: 8, unit: 'pcs', level: 1, hasChildren: false }
                ]
            },
            {
                id: 'bom-v2',
                version: '1.1',
                status: 'draft',
                description: 'Cost reduction',
                effectiveDate: '2023-06-01',
                createdAt: '2023-05-20',
                createdBy: 'Engineer A',
                items: [
                     { id: '1', componentId: 101, componentCode: 'RAW-001', componentName: 'Steel Sheet', quantity: 2, unit: 'pcs', level: 1, hasChildren: false },
                     { id: '2', componentId: 102, componentCode: 'RAW-002-B', componentName: 'Screw M4 Black', quantity: 8, unit: 'pcs', level: 1, hasChildren: false }
                ]
            }
        ];
    }

    async getRouting(productId: string, versionId: string): Promise<RoutingStep[]> {
        await simulateDelay();
        return [
            { id: 'r1', sequence: 10, name: 'Cutting', description: 'Cut steel sheets', workCenter: 'WC-01', setupTime: 30, runTime: 5 },
            { id: 'r2', sequence: 20, name: 'Assembly', description: 'Assemble parts', workCenter: 'WC-02', setupTime: 15, runTime: 10 },
            { id: 'r3', sequence: 30, name: 'Inspection', description: 'Quality Check', workCenter: 'QC-01', setupTime: 0, runTime: 2 }
        ];
    }

    async getSpecs(productId: string): Promise<ProductSpec[]> {
        await simulateDelay();
        return [
            { id: 's1', parameter: 'Length', targetValue: '100', unit: 'mm', minTolerance: '99.5', maxTolerance: '100.5' },
            { id: 's2', parameter: 'Weight', targetValue: '5.2', unit: 'kg', minTolerance: '5.0', maxTolerance: '5.4' }
        ];
    }
    
    async getDocuments(productId: string): Promise<ProductDocument[]> {
        await simulateDelay();
        return [
            { id: 'd1', name: 'Blueprint.pdf', type: 'pdf', url: '#', uploadDate: '2023-01-10', size: '2.4 MB' },
            { id: 'd2', name: '3DModel.stp', type: 'cad', url: '#', uploadDate: '2023-01-12', size: '45 MB' }
        ];
    }
    
    async getAuditLog(productId: string): Promise<AuditLogEntry[]> {
        await simulateDelay();
        return [
             { id: 'l1', action: 'Created', user: 'Admin', timestamp: '2023-01-01 10:00:00', details: 'Product created' },
             { id: 'l2', action: 'BOM Updated', user: 'Engineer', timestamp: '2023-05-20 14:30:00', details: 'Created version 1.1' }
        ];
    }

    async saveBOM(productId: string, version: BOMVersion): Promise<void> {
        console.log('Saving BOM', version);
        return Promise.resolve();
    }
    
    async approveProduct(productId: string): Promise<void> {
        console.log('Approving product', productId);
        return Promise.resolve();
    }
}

class ProductTypeService {
    private readonly endpoint = '/product-type';

    async getAll(): Promise<ProductType[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return MOCK_PRODUCT_TYPES.map(pt => ({
                id: pt.ProductTypeID,
                name: pt.TypeName,
                isActive: pt.Active === 1
            }));
        }
        const response = await apiClient.get<ProductType[]>(this.endpoint);
        return response;
    }

    async getById(id: number): Promise<ProductType> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const pt = MOCK_PRODUCT_TYPES.find(t => t.ProductTypeID === id);
            if (!pt) throw new Error("Not found");
            return {
                id: pt.ProductTypeID,
                name: pt.TypeName,
                isActive: pt.Active === 1
            };
        }
        const response = await apiClient.get<ProductType>(`${this.endpoint}/${id}`);
        return response;
    }

    async create(data: CreateProductTypeDTO): Promise<ProductType> {
         if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                id: Math.random(),
                name: data.name,
                isActive: true
            };
        }
        const response = await apiClient.post<ProductType>(this.endpoint, data);
        return response;
    }

    async update(id: number, data: UpdateProductTypeDTO): Promise<ProductType> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                id: id,
                name: data.name || "Updated",
                isActive: data.isActive ?? true
            };
        }
        const response = await apiClient.put<ProductType>(`${this.endpoint}/${id}`, data);
        return response;
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
