import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialInventory } from './entities/material-inventory.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { InventoryDashboardController } from './controllers/inventory-dashboard.controller';
import { DashboardInventoryService } from './services/dashboard-inventory.service';
import { InventoryBalanceController } from './controllers/inventory-balance.controller';
import { InventoryBalanceService } from './services/inventory-balance.service';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialInventory,
      MaterialMaster,
      WarehouseMaster,
      Supplier,
      InventoryTransaction,
    ]),
  ],
  controllers: [
    InventoryBalanceController,
    InventoryDashboardController,
  ],
  providers: [
    InventoryBalanceService,
    DashboardInventoryService,
  ],
  exports: [
    InventoryBalanceService,
    DashboardInventoryService,
  ],
})
export class MaterialInventoryModule { }
