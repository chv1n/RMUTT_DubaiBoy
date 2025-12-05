import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { MaterialUnits } from './entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialUnits])],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule { }
