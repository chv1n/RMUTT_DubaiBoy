import { Module } from '@nestjs/common';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bom } from './entities/bom.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Bom])],
  controllers: [BomController],
  providers: [BomService],
  exports: [BomService]
})
export class BomModule { }
