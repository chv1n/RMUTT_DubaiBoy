import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseIntPipe } from '@nestjs/common';
import { WarehouseMasterService } from './services/warehouse-master.service';
import { CreateWarehouseMasterDto } from './dto/create-warehouse-master.dto';
import { UpdateWarehouseMasterDto } from './dto/update-warehouse-master.dto';
import { WarehouseMasterQueryDto } from './dto/warehouse-master-query.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums';

@Controller({
  path: 'warehouse',
  version: '1',
})
export class WarehouseMasterController {
  constructor(private readonly warehouseMasterService: WarehouseMasterService) { }

  @Auth(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  create(@Body() createWarehouseMasterDto: CreateWarehouseMasterDto) {
    return this.warehouseMasterService.create(createWarehouseMasterDto);
  }

  @Auth()
  @Get()
  findAll(
    @Query() query: WarehouseMasterQueryDto
  ) {
    return this.warehouseMasterService.findAll(query);
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseMasterService.findOne(id);
  }

  @Auth(Role.SUPER_ADMIN, Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateWarehouseMasterDto: UpdateWarehouseMasterDto) {
    return this.warehouseMasterService.update(id, updateWarehouseMasterDto);
  }

  @Auth(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseMasterService.remove(id);
  }

  @Auth(Role.SUPER_ADMIN, Role.ADMIN)
  @Put(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseMasterService.restore(id);
  }
}
