import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseIntPipe } from '@nestjs/common';
import { WarehouseMasterService } from '../services/warehouse-master.service';
import { CreateWarehouseMasterDto } from '../dto/create-warehouse-master.dto';
import { UpdateWarehouseMasterDto } from '../dto/update-warehouse-master.dto';
import { WarehouseMasterQueryDto } from '../dto/warehouse-master-query.dto';

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
  findAll(
    @Query() query: WarehouseMasterQueryDto
  ) {
    return this.warehouseMasterService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseMasterService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateWarehouseMasterDto: UpdateWarehouseMasterDto) {
    return this.warehouseMasterService.update(id, updateWarehouseMasterDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseMasterService.remove(id);
  }

  @Put(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseMasterService.restore(id);
  }
}
