import { Product, ProductTypeDTO } from "@/types/product";

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Eco-Friendly Water Bottle",
        description: "Reusable water bottle made from recycled materials.",
        sku: "PRD-001",
        price: 25.00,
        quantity: 1500,
        unit: "Pcs",
        unitId: 1,
        minStockLevel: 100,
        materialGroupId: 1,
        containerTypeId: 1,
        status: "active",
        imageUrl: "https://via.placeholder.com/150",
        orderLeadTime: 14,
        containerMaxStock: 5000,
        lifetime: 3650,
        lifetimeUnit: "Days",
        supplierId: 101,
        updateDate: "2023-10-25T10:00:00Z",
        expirationDate: null,
        category: "Consumer Goods",
        lastUpdated: "2023-10-25T10:00:00Z",
        versions: ["v1.0", "v1.1"],
        defaultVersion: "v1.1",
        isApproved: true
    },
    {
        id: 2,
        name: "Wireless Headphones",
        description: "Noise-cancelling wireless headphones with long battery life.",
        sku: "PRD-002",
        price: 120.00,
        quantity: 500,
        unit: "Set",
        unitId: 2,
        minStockLevel: 50,
        materialGroupId: 2,
        containerTypeId: 2,
        status: "active",
        imageUrl: "https://via.placeholder.com/150",
        orderLeadTime: 21,
        containerMaxStock: 1000,
        lifetime: 1095,
        lifetimeUnit: "Days",
        supplierId: 102,
        updateDate: "2023-10-20T14:30:00Z",
        expirationDate: null,
        category: "Electronics",
        lastUpdated: "2023-10-20T14:30:00Z",
        versions: ["v1.0"],
        defaultVersion: "v1.0",
        isApproved: true
    },
    {
        id: 3,
        name: "Office Chair Ergonomic",
        description: "Ergonomic office chair with lumbar support.",
        sku: "PRD-003",
        price: 250.00,
        quantity: 200,
        unit: "Pcs",
        unitId: 1,
        minStockLevel: 20,
        materialGroupId: 3,
        containerTypeId: 3,
        status: "inactive",
        imageUrl: "https://via.placeholder.com/150",
        orderLeadTime: 30,
        containerMaxStock: 500,
        lifetime: 1825,
        lifetimeUnit: "Days",
        supplierId: 103,
        updateDate: "2023-09-15T09:15:00Z",
        expirationDate: null,
        category: "Furniture",
        lastUpdated: "2023-09-15T09:15:00Z",
        versions: ["v1.0", "v1.2"],
        defaultVersion: "v1.2",
        isApproved: false
    }
];

export const MOCK_PRODUCT_TYPES: ProductTypeDTO[] = [
    {
        ProductTypeID: 1,
        TypeName: "Consumer Goods",
        Active: 1,
        UpdateDate: "2023-01-01T00:00:00Z"
    },
    {
        ProductTypeID: 2,
        TypeName: "Electronics",
        Active: 1,
        UpdateDate: "2023-02-15T12:00:00Z"
    },
    {
        ProductTypeID: 3,
        TypeName: "Furniture",
        Active: 0,
        UpdateDate: "2023-06-10T08:30:00Z"
    }
];
