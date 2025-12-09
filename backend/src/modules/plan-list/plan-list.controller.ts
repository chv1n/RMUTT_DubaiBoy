import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { PlanListService } from './plan-list.service';
import { CreatePlanListDto } from './dto/create-plan-list.dto';
import { UpdatePlanListDto } from './dto/update-plan-list.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

@Controller({
  path: 'plan-lists',
  version: '1'
})
export class PlanListController {
  constructor(private readonly planListService: PlanListService) { }

  @Post()
  async create(@Body() createPlanListDto: CreatePlanListDto) {
    const data = await this.planListService.create(createPlanListDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }

  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.planListService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planListService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePlanListDto: UpdatePlanListDto) {
    await this.planListService.update(id, updatePlanListDto);
    return {
      message: 'แก้ไขสำเร็จ'
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.planListService.remove(id);
    return {
      message: 'ลบสำเร็จ'
    };
  }

  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.planListService.restore(id);
    return {
      message: 'กู้คืนสำเร็จ'
    };
  }
}
