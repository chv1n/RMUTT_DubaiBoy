import { Module } from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryTransactionController } from './inventory-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';


@Module({
  imports: [TypeOrmModule.forFeature([InventoryTransaction, MaterialInventory, WarehouseMaster])],
  controllers: [InventoryTransactionController],
  providers: [InventoryTransactionService],
})
export class InventoryTransactionModule { }
