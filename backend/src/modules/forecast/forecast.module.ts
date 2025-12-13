import { Module } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ForecastController } from './forecast.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPlan } from '../product-plan/entities/product-plan.entity';
import { Product } from '../product/entities/product.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPlan, Product, MaterialMaster, InventoryTransaction, MaterialInventory])],
  controllers: [ForecastController],
  providers: [ForecastService],
})
export class ForecastModule { }
