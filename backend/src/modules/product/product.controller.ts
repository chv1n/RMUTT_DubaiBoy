import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { QueryHelper } from 'src/common/helpers/query.helper';

@Controller({
  path: 'products',
  version: '1'
})
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    private readonly service: ProductService
  ) { }


  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const data = await this.service.create(createProductDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }

  @Get()
  findProduct(@Query() baseQueryDto: BaseQueryDto) {
    return QueryHelper.paginate(this.repository, baseQueryDto, { sortField: 'product_name' });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repository.findOneBy({ product_id: id });
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.service.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return {
      message: 'ลบสำเร็จ'
    };
  }

  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.service.restore(id);
    return {
      message: 'กู้คืนสำเร็จ'
    };
  }
}
