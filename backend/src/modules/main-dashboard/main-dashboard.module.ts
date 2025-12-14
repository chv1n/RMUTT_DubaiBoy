import { Module } from '@nestjs/common';
import { MainDashboardController } from './controllers/main-dashboard.controller';
import { MainDashboardService } from './services/main-dashboard.service';
import { UserModule } from '../user/user.module';
import { MaterialModule } from '../material/material.module';
import { ProductPlanModule } from '../product-plan/product-plan.module';
import { MaterialInventoryModule } from '../material-inventory/material-inventory.module';

@Module({
    imports: [
        UserModule,
        MaterialModule,
        ProductPlanModule,
        MaterialInventoryModule,
    ],
    controllers: [MainDashboardController],
    providers: [MainDashboardService],
})
export class MainDashboardModule { }
