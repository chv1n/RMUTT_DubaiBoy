import { Module } from '@nestjs/common';
import { MainDashboardController } from './controllers/main-dashboard.controller';
import { MainDashboardService } from './services/main-dashboard.service';
import { UserModule } from '../user/user.module';
import { MaterialModule } from '../material/material.module';
import { ProductPlanModule } from '../product-plan/product-plan.module';
import { MaterialInventoryModule } from '../material-inventory/material-inventory.module';
import { BomModule } from '../bom/bom.module';
import { MaterialInventory } from 'src/modules/material-inventory/entities/material-inventory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        UserModule,
        MaterialModule,
        ProductPlanModule,
        MaterialInventoryModule,
        TypeOrmModule.forFeature([MaterialInventory]),

    ],
    controllers: [MainDashboardController],
    providers: [MainDashboardService],
})
export class MainDashboardModule { }
