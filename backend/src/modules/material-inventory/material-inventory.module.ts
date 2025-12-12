import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialInventory } from './entities/material-inventory.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { InventoryBalanceController } from './controllers/inventory-balance.controller';
import { InventoryBalanceService } from './services/inventory-balance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialInventory,
      MaterialMaster,
      WarehouseMaster,
      Supplier,
    ]),
  ],
  controllers: [
    InventoryBalanceController,
  ],
  providers: [
    InventoryBalanceService,
  ],
  exports: [
    InventoryBalanceService,
  ],
})
export class MaterialInventoryModule { }
