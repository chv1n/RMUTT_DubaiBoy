import { Module } from '@nestjs/common';
import { ProductPlanService } from './product-plan.service';
import { ProductPlanController } from './product-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPlan } from './entities/product-plan.entity';
import { PlanMaterialAllocation } from './entities/plan-material-allocation.entity';
import { ProductModule } from '../product/product.module';
import { BomModule } from '../bom/bom.module';
import { MaterialInventoryModule } from '../material-inventory/material-inventory.module';
import { MaterialModule } from '../material/material.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { StockReservationService } from './services/stock-reservation.service';
import { PlanWorkflowService } from './services/plan-workflow.service';
import { PlanReportService } from './services/plan-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductPlan, PlanMaterialAllocation, MaterialInventory]),
    ProductModule,
    BomModule,
    MaterialInventoryModule,
    MaterialModule,
    AuditLogModule,
  ],
  controllers: [ProductPlanController],
  providers: [
    ProductPlanService,
    StockReservationService,
    PlanWorkflowService,
    PlanReportService,
  ],
  exports: [ProductPlanService, PlanWorkflowService],
})
export class ProductPlanModule { }


