import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MaterialGroupService } from './material-group.service';
import { CreateMaterialGroupDto } from './dto/create-material-group.dto';
import { UpdateMaterialGroupDto } from './dto/update-material-group.dto';

@Controller({
    path: 'material-groups',
    version: '1'
})
export class MaterialGroupController {
    constructor(private readonly service: MaterialGroupService) { }

    @Post()
    async create(@Body() createMaterialGroupDto: CreateMaterialGroupDto) {
        const data = await this.service.create(createMaterialGroupDto);
        return {
            message: 'เพิ่มกลุ่มวัตถุดิบสำเร็จ',
            data
        };
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateMaterialGroupDto: UpdateMaterialGroupDto) {
        const data = await this.service.update(id, updateMaterialGroupDto);
        return {
            message: 'แก้ไขกลุ่มวัตถุดิบสำเร็จ',
            data
        };
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.service.remove(id);
        return {
            message: 'ลบสำเร็จ',
        };
    }
}
