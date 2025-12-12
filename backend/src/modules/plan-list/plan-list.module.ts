import { Module } from '@nestjs/common';
import { PlanListService } from './plan-list.service';
import { PlanListController } from './plan-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanList } from './entities/plan-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanList])],
  controllers: [PlanListController],
  providers: [PlanListService],
})
export class PlanListModule { }
