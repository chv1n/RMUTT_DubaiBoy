import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { MaterialModule } from "./material/material.module";
import { MaterialGroupModule } from "./material-group/material-group.module";
import { ContainerTypeModule } from "./container-type/container-type.module";
import { UnitModule } from "./unit/unit.module";
import { SupplierModule } from "./supplier/supplier.module";
import { BomModule } from "./bom/bom.module";
import { InventoryTransactionModule } from "./inventory-transaction/inventory-transaction.module";
import { WarehouseMasterModule } from "./warehouse-master/warehouse-master.module";
import { MaterialInventoryModule } from "./material-inventory/material-inventory.module";
import { ProductModule } from "./product/product.module";
import { ProductTypeModule } from "./product-type/product-type.module";
import { ProductPlanModule } from "./product-plan/product-plan.module";
import { PlanListModule } from "./plan-list/plan-list.module";
import { AuditLogModule } from "./audit-log/audit-log.module";


export const AppModules = [
    AuditLogModule,
    MaterialModule,
    MaterialGroupModule,
    ContainerTypeModule,
    UnitModule,
    SupplierModule,
    AuthModule,
    UserModule,
    BomModule,
    InventoryTransactionModule,
    WarehouseMasterModule,
    MaterialInventoryModule,
    ProductModule,
    ProductTypeModule,
    ProductPlanModule,
    PlanListModule,
]

