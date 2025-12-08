import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductTypeModule } from '../product-type/product-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ProductTypeModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }
