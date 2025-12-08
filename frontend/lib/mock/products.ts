
import { ProductDTO, ProductTypeDTO, BomDTO } from "@/types/product";

export const MOCK_PRODUCT_TYPES: ProductTypeDTO[] = [
    {
        product_type_id: 1,
        type_name: "Electronics",
        active: 1,
        create_date: "2023-01-01T00:00:00Z",
        update_date: "2023-01-01T00:00:00Z"
    },
    {
        product_type_id: 2,
        type_name: "Furniture",
        active: 1,
        create_date: "2023-01-02T00:00:00Z",
        update_date: "2023-01-02T00:00:00Z"
    },
    {
        product_type_id: 3,
        type_name: "Stationery",
        active: 1,
        create_date: "2023-01-03T00:00:00Z",
        update_date: "2023-01-03T00:00:00Z"
    }
];

export const MOCK_BOMS: BomDTO[] = [
    {
        id: 101,
        product_id: 1,
        material_id: 1, // Assumes Material ID 1 exists
        unit_id: 1,
        usage_per_piece: 5,
        version: 1,
        active: 1,
        scrap_factor: 0.05,
        created_at: "2023-01-10T10:00:00Z",
        updated_at: "2023-01-10T10:00:00Z",
        material: {
            material_id: 1,
            material_name: "Plastic Granules",
            cost_per_unit: 50
        },
        unit: {
            unit_id: 1,
            unit_name: "kg"
        }
    },
    {
        id: 102,
        product_id: 1,
        material_id: 2,
        unit_id: 2,
        usage_per_piece: 1,
        version: 1,
        active: 1,
        scrap_factor: 0,
        created_at: "2023-01-10T10:00:00Z",
        updated_at: "2023-01-10T10:00:00Z",
        material: {
            material_id: 2,
            material_name: "Screw M4",
            cost_per_unit: 0.5
        },
        unit: {
            unit_id: 2,
            unit_name: "pcs"
        }
    }
];

export const MOCK_PRODUCTS: ProductDTO[] = [
    {
        product_id: 1,
        product_name: "Ergonomic Chair",
        product_type_id: 2,
        active: 1,
        create_date: "2023-01-15T09:00:00Z",
        update_date: "2023-01-20T14:30:00Z",
        product_type: MOCK_PRODUCT_TYPES[1],
        boms: MOCK_BOMS
    },
    {
        product_id: 2,
        product_name: "Gaming Mouse",
        product_type_id: 1,
        active: 1,
        create_date: "2023-02-01T11:20:00Z",
        update_date: "2023-02-05T16:45:00Z",
        product_type: MOCK_PRODUCT_TYPES[0],
        boms: []
    },
    {
        product_id: 3,
        product_name: "Notebook A4",
        product_type_id: 3,
        active: 0, // Inactive
        create_date: "2023-03-10T08:15:00Z",
        update_date: "2023-03-10T08:15:00Z",
        product_type: MOCK_PRODUCT_TYPES[2],
        boms: []
    }
];
