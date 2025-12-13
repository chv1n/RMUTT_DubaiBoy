import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseIntPipe } from '@nestjs/common';
import { BomService } from './bom.service';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { GetBomDto } from './dto/get-bom.dto';

import { CalculateBomDto } from './dto/calculate-bom.dto';

@Controller({
  path: 'boms',
  version: '1'
})
export class BomController {
  constructor(private readonly bomService: BomService) { }

  @Get('calculate')
  async calculateMaterialRequirement(@Query() query: CalculateBomDto) {
    const data = await this.bomService.calculateMaterialRequirement(query.product_id, query.quantity);
    return {
      success: true,
      message: 'คำนวณสำเร็จ',
      data
    };
  }

  @Post()
  async create(@Body() createBomDto: CreateBomDto) {
    const data = await this.bomService.create(createBomDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }

  @Get()
  findAll(@Query() query: GetBomDto) {
    return this.bomService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bomService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateBomDto: UpdateBomDto) {
    await this.bomService.update(id, updateBomDto);
    return {
      message: 'แก้ไขสำเร็จ'
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bomService.remove(id);
    return {
      message: 'ลบสำเร็จ'
    };
  }

  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.bomService.restore(id);
    return {
      message: 'กู้คืนสำเร็จ'
    };
  }
}
