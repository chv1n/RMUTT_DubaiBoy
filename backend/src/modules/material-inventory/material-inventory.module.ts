import { Module } from '@nestjs/common';
import { MaterialInventoryService } from './material-inventory.service';
import { MaterialInventoryController } from './material-inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialInventory } from './entities/material-inventory.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialInventory, MaterialMaster, WarehouseMaster, Supplier, InventoryTransaction])],
  controllers: [MaterialInventoryController],
  providers: [MaterialInventoryService],
})
export class MaterialInventoryModule { }
