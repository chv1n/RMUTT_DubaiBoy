import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';

import { TransactionController } from './controllers/transaction.controller';
import { ReportingController } from './controllers/reporting.controller';

import { TransactionMovementService } from './services/transaction-movement.service';
import { ReportingService } from './services/reporting.service';

import { MaterialInventoryModule } from '../material-inventory/material-inventory.module';
import { PushSubscriptionModule } from '../push-subscription/push-subscription.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryTransaction,
      MaterialInventory,
      MaterialMaster,
      WarehouseMaster,
    ]),
    MaterialInventoryModule,
    PushSubscriptionModule,
  ],
  controllers: [
    TransactionController,
    ReportingController,
  ],
  providers: [
    TransactionMovementService,
    ReportingService,
  ],
  exports: [
    TransactionMovementService,
    ReportingService,
  ],
})
export class InventoryTransactionModule { }
