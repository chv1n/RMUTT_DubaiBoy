import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { MaterialMaster } from './entities/material-master.entity';
import { MaterialGroup } from '../material-group/entities/material-group.entity';
import { MaterialContainerType } from '../container-type/entities/container-type.entity';
import { MaterialUnits } from '../unit/entities/unit.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialMaster,
      MaterialGroup,
      MaterialContainerType,
      MaterialUnits,
      Supplier,
      InventoryTransaction,
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule { }
