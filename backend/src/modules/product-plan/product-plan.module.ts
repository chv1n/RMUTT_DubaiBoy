import { Module } from '@nestjs/common';
import { ProductPlanService } from './product-plan.service';
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
import { ProductPlanController } from './controlles/product-plan.controller';
import { PlanDashboardController } from './controlles/dashboard.controller';
import { DashboardPlanService } from './services/dash-board.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductPlan, PlanMaterialAllocation, MaterialInventory]),
    ProductModule,
    BomModule,
    MaterialInventoryModule,
    MaterialModule,
    AuditLogModule,
  ],
  controllers: [ProductPlanController, PlanDashboardController],
  providers: [
    ProductPlanService,
    StockReservationService,
    PlanWorkflowService,
    PlanReportService,
    DashboardPlanService,
  ],
  exports: [ProductPlanService, PlanWorkflowService],
})
export class ProductPlanModule { }


