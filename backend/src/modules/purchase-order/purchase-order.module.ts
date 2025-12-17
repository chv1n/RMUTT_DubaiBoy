import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { PurchaseOrderController } from './controllers/purchase-order.controller';
import { PurchaseOrderService } from './services/purchase-order.service';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { ProductPlan } from '../product-plan/entities/product-plan.entity';
import { PlanMaterialAllocation } from '../product-plan/entities/plan-material-allocation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PurchaseOrder,
            PurchaseOrderItem,
            MaterialMaster,
            Supplier,
            ProductPlan,
            PlanMaterialAllocation
        ])
    ],
    controllers: [PurchaseOrderController],
    providers: [PurchaseOrderService],
    exports: [PurchaseOrderService]
})
export class PurchaseOrderModule { }
