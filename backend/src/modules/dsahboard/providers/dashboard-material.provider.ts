import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialMaster } from '../../material/entities/material-master.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardMaterialProvider {
    constructor(
        @InjectRepository(MaterialMaster)
        private materialRepository: Repository<MaterialMaster>,
    ) { }

    async getMaterialStats() {
        const materials = await this.materialRepository.find({
            relations: ['materialInventory'],
        });
        const totalMaterials = materials.length;
        let lowStock = 0;
        let outOfStock = 0;
        let activeMaterials = 0;

        materials.forEach((m) => {
            if (m.is_active) activeMaterials++;
            const totalQty = m.materialInventory
                ? m.materialInventory.reduce((sum, inv) => sum + inv.quantity, 0)
                : 0;

            if (totalQty === 0) outOfStock++;
            else if (m.container_min_stock && totalQty < m.container_min_stock)
                lowStock++;
        });

        return {
            total: totalMaterials,
            lowStock,
            outOfStock,
            active: activeMaterials,
            change: 0, // Mock
        };
    }
}
