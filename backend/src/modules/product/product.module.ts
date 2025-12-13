import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductDashboardController } from './controllers/product-dashboard.controller';
import { DashboardProductService } from './services/dashboard-product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]),],
  controllers: [ProductController, ProductDashboardController],
  providers: [ProductService, DashboardProductService],
  exports: [ProductService, DashboardProductService]
})
export class ProductModule { }
