import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums';

@Controller({
  path: 'products',
  version: '1'
})
export class ProductController {
  constructor(
    private readonly service: ProductService
  ) { }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const data = await this.service.create(createProductDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }

  @Auth()
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.service.findAll(query);
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.service.update(id, updateProductDto);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return {
      message: 'ลบสำเร็จ'
    };
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.service.restore(id);
    return {
      message: 'กู้คืนสำเร็จ'
    };
  }
}
