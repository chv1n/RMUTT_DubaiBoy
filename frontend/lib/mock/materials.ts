import { MaterialDTO } from "@/types/materials";

export const MOCK_MATERIALS_DATA: MaterialDTO[] = [
    {
        material_id: 101,
        material_group_id: 4,
        material_name: "Steel Rod 10mm",
        order_leadtime: 7,
        container_type_id: 1,
        quantity_per_container: 50,
        unit_id: 1,
        container_min_stock: 10,
        container_max_stock: 100,
        lifetime: 24,
        lifetime_unit: "month",
        active: 1,
        supplier_id: 1,
        update_date: "2025-11-01T10:00:00Z",
        cost_per_unit: 15.50,
        expiration_date: "2027-11-01T00:00:00Z",
        container_type: { type_id: 1, type_name: "Box" },
        unit: { unit_id: 1, unit_name: "Pieces" },
        supplier: {
            supplier_id: 1,
            supplier_name: "Global Tech Supplies",
            phone: "123-456-7890",
            email: "contact@globaltech.com",
            address: "123 Tech Rd",
            active: 1
        },
        material_group: { group_id: 4, group_name: "Construction" }
    },
    {
        material_id: 102,
        material_group_id: 4,
        material_name: "Silicon Pellet",
        order_leadtime: 5,
        container_type_id: 2,
        quantity_per_container: 20,
        unit_id: 2,
        container_min_stock: 5,
        container_max_stock: 40,
        lifetime: 12,
        lifetime_unit: "month",
        active: 1,
        supplier_id: 10,
        update_date: "2025-11-02T12:30:00Z",
        cost_per_unit: 22.0,
        expiration_date: "2026-06-01T00:00:00Z",
        container_type: { type_id: 2, type_name: "Bag" },
        unit: { unit_id: 2, unit_name: "Kilogram" },
        supplier: {
            supplier_id: 10,
            supplier_name: "Techno Materials Co., Ltd.",
            phone: "0891234567",
            email: "contact@techno.co.th",
            address: "Bangkok, Thailand",
            active: 1
        },
        material_group: { group_id: 4, group_name: "Construction" }
    },
    {
        material_id: 103,
        material_group_id: 1,
        material_name: "Copper Wire",
        order_leadtime: 3,
        container_type_id: 3,
        quantity_per_container: 100,
        unit_id: 3,
        container_min_stock: 20,
        container_max_stock: 200,
        lifetime: 36,
        lifetime_unit: "month",
        active: 1,
        supplier_id: 2,
        update_date: "2025-10-15T09:00:00Z",
        cost_per_unit: 5.75,
        expiration_date: "2028-10-15T00:00:00Z",
        container_type: { type_id: 3, type_name: "Spool" },
        unit: { unit_id: 3, unit_name: "Meter" },
        supplier: {
            supplier_id: 2,
            supplier_name: "ElectroComponents Inc.",
            phone: "987-654-3210",
            email: "sales@electro.com",
            address: "456 Circuit Blvd",
            active: 1
        },
        material_group: { group_id: 1, group_name: "Electronics" }
    },
    // Generating more mock data to test pagination
    ...Array.from({ length: 25 }).map((_, i) => ({
        material_id: 200 + i,
        material_group_id: 5,
        material_name: `Office Paper A4 - Batch ${i + 1}`,
        order_leadtime: 2,
        container_type_id: 1,
        quantity_per_container: 500,
        unit_id: 4,
        container_min_stock: 10,
        container_max_stock: 50,
        lifetime: 0,
        lifetime_unit: "N/A",
        active: i % 5 === 0 ? 0 : 1, // Some inactive
        supplier_id: 3,
        update_date: new Date().toISOString(),
        cost_per_unit: 4.50,
        expiration_date: "2030-01-01T00:00:00Z",
        container_type: { type_id: 1, type_name: "Box" },
        unit: { unit_id: 4, unit_name: "Ream" },
        supplier: {
            supplier_id: 3,
            supplier_name: "Office Depot Mock",
            phone: "555-0199",
            email: "supply@office.com",
            address: "789 Paper St",
            active: 1
        },
        material_group: { group_id: 5, group_name: "Office Supplies" }
    }))
];

export const MOCK_MATERIAL_GROUPS: any[] = [
    { group_id: 1, group_name: "Electronics", abbreviation: "ELEC" },
    { group_id: 4, group_name: "Construction", abbreviation: "CONST" },
    { group_id: 5, group_name: "Office Supplies", abbreviation: "OFF" }
];

export const MOCK_CONTAINER_TYPES: any[] = [
    { type_id: 1, type_name: "Box" },
    { type_id: 2, type_name: "Bag" },
    { type_id: 3, type_name: "Spool" }
];
