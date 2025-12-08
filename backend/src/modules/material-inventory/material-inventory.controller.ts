import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { MaterialInventoryService } from './material-inventory.service';
import { CreateMaterialInventoryDto } from './dto/create-material-inventory.dto';
import { UpdateMaterialInventoryDto } from './dto/update-material-inventory.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { MaterialInventoryDto } from 'src/common/dto/material-inventory-query.dto';

@Controller({
  path: 'material-inventory',
  version: '1',
})
export class MaterialInventoryController {
  constructor(private readonly materialInventoryService: MaterialInventoryService) { }

  @Post()
  create(@Body() createMaterialInventoryDto: CreateMaterialInventoryDto) {
    return this.materialInventoryService.create(createMaterialInventoryDto);
  }

  @Get()
  findAll(@Query() baseQueryDto: BaseQueryDto,
    @Query() materialInventoryDto: MaterialInventoryDto) {
    return this.materialInventoryService.findAll(baseQueryDto, materialInventoryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialInventoryService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMaterialInventoryDto: UpdateMaterialInventoryDto) {
    return this.materialInventoryService.update(+id, updateMaterialInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialInventoryService.remove(+id);
  }
}
