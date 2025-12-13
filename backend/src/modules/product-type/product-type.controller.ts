import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { ProductType } from './entities/product-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/common/enums';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller({
  path: 'product-types',
  version: '1'
})
export class ProductTypeController {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,
    private readonly service: ProductTypeService) { }

  @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() createProductTypeDto: CreateProductTypeDto) {
    const data = await this.service.create(createProductTypeDto);
    return {
      message: 'เพิ่มสำเร็จ',
      data
    };
  }

  @Auth()
  @Get()
  findAll(@Query() query: BaseQueryDto) {
    return this.service.findAll(query);
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productTypeRepository.findBy({ product_type_id: id });
  }

  @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductTypeDto: UpdateProductTypeDto) {
    const data = await this.service.update(id, updateProductTypeDto);
    return {
      message: 'แก้ไขสำเร็จ',
      data
    };
  }
  @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return {
      message: 'ลบสำเร็จ'
    };
  }

  @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.service.restore(id);
    return {
      message: 'กู้คืนสำเร็จ'
    };
  }


}
