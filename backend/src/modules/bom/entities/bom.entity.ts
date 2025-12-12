import { Exclude } from "class-transformer";
import { MaterialMaster } from "src/modules/material/entities/material-master.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { MaterialUnits } from "src/modules/unit/entities/unit.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'BOM' })
export class Bom {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;


    @ManyToOne(() => Product, (product) => product.boms)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => MaterialMaster, (material) => material.boms)
    @JoinColumn({ name: 'material_id' })
    material: MaterialMaster;

    @ManyToOne(() => MaterialUnits, (unit) => unit.boms)
    @JoinColumn({ name: 'unit_id' })
    unit: MaterialUnits;

    @Column({ name: 'unit_id', type: 'int', })
    unit_id: number;

    @Column({ name: 'product_id', type: 'int' })
    product_id: number;

    @Column({ name: 'material_id', type: 'int' })
    material_id: number;

    @Column({ name: 'usage_per_piece', type: 'decimal' })
    usage_per_piece: number;

    @Column({ name: 'version', type: 'varchar' })
    version: number;

    @Column({ name: 'active', type: 'boolean' })
    active: number;

    @Column({ name: 'scrap_factor', type: 'decimal' })
    scrap_factor: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    @Exclude()
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
    deleted_at: Date;

}
