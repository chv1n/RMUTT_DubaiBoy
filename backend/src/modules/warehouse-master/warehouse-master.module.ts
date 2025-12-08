import { Module } from '@nestjs/common';
import { WarehouseMasterService } from './warehouse-master.service';
import { WarehouseMasterController } from './warehouse-master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseMaster } from './entities/warehouse-master.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseMaster, InventoryTransaction])],
  controllers: [WarehouseMasterController],
  providers: [WarehouseMasterService],
})
export class WarehouseMasterModule { }
