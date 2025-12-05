import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialGroupService } from './material-group.service';
import { MaterialGroupController } from './material-group.controller';
import { MaterialGroup } from './entities/material-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialGroup])],
  controllers: [MaterialGroupController],
  providers: [MaterialGroupService],
})
export class MaterialGroupModule { }
