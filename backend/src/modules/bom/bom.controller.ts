import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { BomService } from './bom.service';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { QureyBomDto } from './dto/qurey-bom.dto';

@Controller({
  path: 'bom',
  version: '1'
})
export class BomController {
  constructor(private readonly bomService: BomService) { }

  @Post()
  create(@Body() createBomDto: CreateBomDto) {
    return this.bomService.create(createBomDto);
  }

  @Get()
  findAll(@Query() query: QureyBomDto) {
    return this.bomService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bomService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBomDto: UpdateBomDto) {
    return this.bomService.update(+id, updateBomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bomService.remove(+id);
  }
}
