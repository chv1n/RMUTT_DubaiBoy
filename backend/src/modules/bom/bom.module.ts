import { Module } from '@nestjs/common';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bom } from './entities/bom.entity';
import { Product } from '../product/entities/product.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bom, Product, MaterialMaster])],
  controllers: [BomController],
  providers: [BomService],
  exports: [BomService]
})
export class BomModule { }
