import { IWarehouseStock } from './warehouse-stock.interface';

/**
 * Interface สำหรับ Material Requirement ใน Plan Preview
 * แสดงรายละเอียดการคำนวณวัสดุที่ต้องใช้
 */
export interface IMaterialRequirement {
    material_id: number;
    material_name: string;
    unit_id: number;
    unit_name: string;

    // Calculation Details
    usage_per_piece: number;      // จำนวนที่ใช้ต่อชิ้น
    scrap_factor: number;         // อัตราการสูญเสีย (ค่าทศนิยม เช่น 0.05 = 5%)
    production_quantity: number;   // จำนวนที่ต้องการผลิต
    net_quantity: number;          // ปริมาณสุทธิ = usage_per_piece × production_quantity
    scrap_quantity: number;        // ปริมาณสูญเสีย = net_quantity × scrap_factor
    required_quantity: number;     // ปริมาณที่ต้องใช้ทั้งหมด = net_quantity + scrap_quantity

    // Cost
    unit_cost: number;
    total_cost: number;

    // Stock Availability
    stock_by_warehouse: IWarehouseStock[];
}

