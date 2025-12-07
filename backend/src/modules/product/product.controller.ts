import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller({
  path: 'product',
  version: '1'
})
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findProduct(@Query('limit') limit: number,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('sortBy') sortBy: string = 'product_id',
    @Query('offset') offset: number = 0,
    @Query('name') name: string = '',
    @Query('type') typeId: number = 0,
    @Query('active') active: number = 1
  ) {
    return this.productService.findAll(limit, order, sortBy, name, typeId, offset, active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
