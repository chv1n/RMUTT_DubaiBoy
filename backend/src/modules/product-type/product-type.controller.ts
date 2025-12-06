import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';

@Controller({
  path: 'product-type',
  version: '1'
})
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) { }

  @Post()
  create(@Body() createProductTypeDto: CreateProductTypeDto) {
    return this.productTypeService.create(createProductTypeDto);
  }

  @Get()
  findAll(@Query('limit') limit: number,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('sortBy') sortBy: string = 'product_type_id',
    @Query('offset') offset: number = 0,
    @Query('name') name: string = '',
    @Query('active') active: number = 1
  ) {
    return this.productTypeService.findAll(limit, order, sortBy, name, offset, active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productTypeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductTypeDto: UpdateProductTypeDto) {
    return this.productTypeService.update(+id, updateProductTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productTypeService.remove(+id);
  }
}
