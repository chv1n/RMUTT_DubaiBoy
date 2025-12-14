import { Module } from '@nestjs/common';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bom } from './entities/bom.entity';
import { MaterialModule } from '../material/material.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bom]), MaterialModule, ProductModule],
  controllers: [BomController],
  providers: [BomService],
  exports: [BomService]
})
export class BomModule { }
