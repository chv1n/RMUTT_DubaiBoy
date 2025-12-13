import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { WarehouseDashboardController } from './controllers/warehouse-dashboard.controller';
import { DashboardWarehouseService } from './services/dashboard-warehouse.service';
import { WarehouseMaster } from './entities/warehouse-master.entity';
import { WarehouseMasterController } from './controllers/warehouse-master.controller';
import { WarehouseMasterService } from './services/warehouse-master.service';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseMaster, InventoryTransaction, MaterialInventory])],
  controllers: [WarehouseMasterController, WarehouseDashboardController],
  providers: [WarehouseMasterService, DashboardWarehouseService],
  exports: [WarehouseMasterService, DashboardWarehouseService],
})
export class WarehouseMasterModule { }
