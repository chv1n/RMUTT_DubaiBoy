import { Controller, Get, Post, Body, Put, Param, Query, Delete, ParseIntPipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialQueryDto } from './dto/material-query.dto';

@Controller({
  path: 'materials',
  version: '1'
})
export class MaterialController {
  constructor(private readonly materialService: MaterialService) { }

  @Post()
  async create(@Body() createMaterialDto: CreateMaterialDto) {
    const data = await this.materialService.create(createMaterialDto);
    return {
      message: `เพิ่ม ${data.material_name} สำเร็จ`,
      data,
    };
  }

  @Get()
  async findAll(@Query() query: MaterialQueryDto) {
    return this.materialService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    const data = await this.materialService.update(id, updateMaterialDto);
    return {
      message: `แก้ไข ${data.material_name} สำเร็จ`,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.materialService.remove(id);
    return {
      message: 'ลบสำเร็จ (Soft Delete)',
    };
  }
}
