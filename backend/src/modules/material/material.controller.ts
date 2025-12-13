import { Controller, Get, Post, Body, Put, Param, Query, Delete, ParseIntPipe } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialQueryDto } from './dto/material-query.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums';

@Controller({
  path: 'materials',
  version: '1'
})
export class MaterialController {
  constructor(private readonly materialService: MaterialService) { }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() createMaterialDto: CreateMaterialDto) {
    const data = await this.materialService.create(createMaterialDto);
    return {
      message: `เพิ่มสำเร็จ`,
      data,
    };
  }

  @Auth()
  @Get()
  async findAll(@Query() query: MaterialQueryDto) {
    return this.materialService.findAll(query);
  }

  @Auth()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findOne(id);
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    const data = await this.materialService.update(id, updateMaterialDto);
    return {
      message: `แก้ไขสำเร็จ`,
      data,
    };
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.materialService.remove(+id);
    return {
      message: 'ลบวัสดุสำเร็จ',
    };
  }

  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id/restore')
  async restore(@Param('id') id: number) {
    await this.materialService.restore(+id);
    return {
      message: 'กู้คืนวัสดุสำเร็จ',
    };
  }

}
