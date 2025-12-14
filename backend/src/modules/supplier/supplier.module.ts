import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierService } from './services/supplier.service';
import { SupplierController } from './controllers/supplier.controller';
import { Supplier } from './entities/supplier.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';
import { SupplierDashboardController } from './controllers/supplier-dashboard.controller';
import { DashboardSupplierService } from './services/dashboard-supplier.service';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, InventoryTransaction])],
  controllers: [SupplierController, SupplierDashboardController],
  providers: [SupplierService, DashboardSupplierService],
  exports: [SupplierService, DashboardSupplierService],
})
export class SupplierModule { }
