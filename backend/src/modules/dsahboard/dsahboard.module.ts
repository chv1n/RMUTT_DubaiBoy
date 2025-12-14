import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { ProductPlan } from '../product-plan/entities/product-plan.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';
import { DsahboardService } from './dsahboard.service';
import { DsahboardController } from './dsahboard.controller';
import { DashboardUserProvider } from './providers/dashboard-user.provider';
import { DashboardMaterialProvider } from './providers/dashboard-material.provider';
import { DashboardPlanProvider } from './providers/dashboard-plan.provider';
import { DashboardInventoryProvider } from './providers/dashboard-inventory.provider';
import { DashboardSystemProvider } from './providers/dashboard-system.provider';
import { DashboardAlertProvider } from './providers/dashboard-alert.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      MaterialMaster,
      ProductPlan,
      MaterialInventory,
      InventoryTransaction,
    ]),
  ],
  controllers: [DsahboardController],
  providers: [
    DsahboardService,
    DashboardUserProvider,
    DashboardMaterialProvider,
    DashboardPlanProvider,
    DashboardInventoryProvider,
    DashboardSystemProvider,
    DashboardAlertProvider,
  ],
})
export class DsahboardModule { }
