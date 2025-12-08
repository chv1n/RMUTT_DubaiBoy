import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { WarehouseMasterService } from './warehouse-master.service';
import { CreateWarehouseMasterDto } from './dto/create-warehouse-master.dto';
import { UpdateWarehouseMasterDto } from './dto/update-warehouse-master.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { WarehouseDto } from 'src/common/dto/warehouse-query.dto';

@Controller({
  path: 'warehouse',
  version: '1',
})
export class WarehouseMasterController {
  constructor(private readonly warehouseMasterService: WarehouseMasterService) { }

  @Post()
  create(@Body() createWarehouseMasterDto: CreateWarehouseMasterDto) {
    return this.warehouseMasterService.create(createWarehouseMasterDto);
  }

  @Get()
  findAll(@Query() BaseQueryDto: BaseQueryDto,
    @Query() warehouseDto: WarehouseDto) {
    return this.warehouseMasterService.findAll(BaseQueryDto, warehouseDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseMasterService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateWarehouseMasterDto: UpdateWarehouseMasterDto) {
    return this.warehouseMasterService.update(+id, updateWarehouseMasterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseMasterService.remove(+id);
  }
}
