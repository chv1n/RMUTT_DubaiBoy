import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { Supplier } from './entities/supplier.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, InventoryTransaction])],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule { }
