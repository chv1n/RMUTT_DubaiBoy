import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialService } from './services/material.service';
import { MaterialController } from './controllers/material.controller';
import { MaterialMaster } from './entities/material-master.entity';
import { MaterialGroup } from '../material-group/entities/material-group.entity';
import { MaterialContainerType } from '../container-type/entities/container-type.entity';
import { MaterialUnits } from '../unit/entities/unit.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';
import { MaterialDashboardController } from './controllers/material-dashboard.controller';
import { DashboardMaterialService } from './services/dashboard-material.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialMaster,
      MaterialGroup,
      MaterialContainerType,
      MaterialUnits,
      Supplier,
      InventoryTransaction,
      MaterialInventory,
      WarehouseMaster
    ]),
  ],
  controllers: [MaterialController, MaterialDashboardController],
  providers: [MaterialService, DashboardMaterialService],
  exports: [MaterialService, DashboardMaterialService],
})
export class MaterialModule { }
