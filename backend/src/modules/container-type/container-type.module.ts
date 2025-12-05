import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContainerTypeService } from './container-type.service';
import { ContainerTypeController } from './container-type.controller';
import { MaterialContainerType } from './entities/container-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialContainerType])],
  controllers: [ContainerTypeController],
  providers: [ContainerTypeService],
})
export class ContainerTypeModule { }
