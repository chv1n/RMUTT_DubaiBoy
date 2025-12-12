import { Module } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ForecastController } from './forecast.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPlan } from '../product-plan/entities/product-plan.entity';
import { PlanList } from '../plan-list/entities/plan-list.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPlan, PlanList, Product])],
  controllers: [ForecastController],
  providers: [ForecastService],
})
export class ForecastModule { }
