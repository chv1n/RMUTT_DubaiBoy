import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { ProductPlanService } from './product-plan.service';
import { CreateProductPlanDto } from './dto/create-product-plan.dto';
import { UpdateProductPlanDto } from './dto/update-product-plan.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

@Controller({
  path: 'product-plan',
  version: '1'
})
export class ProductPlanController {
  constructor(private readonly productPlanService: ProductPlanService) { }

  @Post()
  async create(@Body() createProductPlanDto: CreateProductPlanDto) {
    const data = await this.productPlanService.create(createProductPlanDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }

  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.productPlanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productPlanService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductPlanDto: UpdateProductPlanDto) {
    await this.productPlanService.update(id, updateProductPlanDto);
    return {
      message: 'แก้ไขสำเร็จ'
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productPlanService.remove(id);
    return {
      message: 'ลบสำเร็จ'
    };
  }

  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.productPlanService.restore(id);
    return {
      message: 'กู้คืนสำเร็จ'
    };
  }
}
