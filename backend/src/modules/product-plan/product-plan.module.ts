import { Module } from '@nestjs/common';
import { ProductPlanService } from './product-plan.service';
import { ProductPlanController } from './product-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPlan } from './entities/product-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPlan])],
  controllers: [ProductPlanController],
  providers: [ProductPlanService],
})
export class ProductPlanModule { }
