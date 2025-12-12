import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductPlan } from './product-plan.entity';
import { MaterialMaster } from 'src/modules/material/entities/material-master.entity';
import { WarehouseMaster } from 'src/modules/warehouse-master/entities/warehouse-master.entity';
import { MaterialInventory } from 'src/modules/material-inventory/entities/material-inventory.entity';

/**
 * Entity สำหรับบันทึกการจัดสรรวัสดุให้กับ Plan
 * บันทึกว่าดึงวัสดุจาก Warehouse/Inventory ไหน จำนวนเท่าไร
 * 
 * Single Responsibility: เก็บข้อมูลการจัดสรรวัสดุเท่านั้น
 */
@Entity('plan_material_allocation')
export class PlanMaterialAllocation {
    @PrimaryGeneratedColumn()
    id: number;

    // === Relations ===

    @ManyToOne(() => ProductPlan, (plan) => plan.material_allocations)
    @JoinColumn({ name: 'plan_id' })
    plan: ProductPlan;

    @Column({ name: 'plan_id' })
    plan_id: number;

    @ManyToOne(() => MaterialMaster)
    @JoinColumn({ name: 'material_id' })
    material: MaterialMaster;

    @Column({ name: 'material_id' })
    material_id: number;

    @ManyToOne(() => WarehouseMaster)
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: WarehouseMaster;

    @Column({ name: 'warehouse_id' })
    warehouse_id: number;

    @ManyToOne(() => MaterialInventory)
    @JoinColumn({ name: 'inventory_id' })
    inventory: MaterialInventory;

    @Column({ name: 'inventory_id' })
    inventory_id: number;

    // === Quantity Fields ===

    /** จำนวนที่จอง */
    @Column({ name: 'allocated_quantity', type: 'decimal', precision: 15, scale: 3 })
    allocated_quantity: number;

    /** จำนวนที่ใช้จริง (คำนวณตอน complete/cancel) */
    @Column({ name: 'used_quantity', type: 'decimal', precision: 15, scale: 3, default: 0 })
    used_quantity: number;

    /** จำนวนที่คืนกลับ stock */
    @Column({ name: 'returned_quantity', type: 'decimal', precision: 15, scale: 3, default: 0 })
    returned_quantity: number;

    // === Cost Fields ===

    /** ราคาต่อหน่วย ณ ขณะจอง (เก็บไว้เพื่อคำนวณต้นทุน) */
    @Column({ name: 'unit_cost', type: 'decimal', precision: 15, scale: 2 })
    unit_cost: number;

    // === Timestamps ===

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
