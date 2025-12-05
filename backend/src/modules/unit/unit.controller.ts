import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Controller({
    path: 'units',
    version: '1'
})
export class UnitController {
    constructor(private readonly service: UnitService) { }

    @Post()
    async create(@Body() createUnitDto: CreateUnitDto) {
        const data = await this.service.create(createUnitDto);
        return {
            message: 'เพิ่มหน่วยนับสำเร็จ',
            data
        };
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.service.findOne(+id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateUnitDto: UpdateUnitDto) {
        const data = await this.service.update(+id, updateUnitDto);
        return {
            message: 'แก้ไขหน่วยนับสำเร็จ',
            data
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        await this.service.remove(+id);
        return {
            message: 'ลบหน่วยนับสำเร็จ'
        };
    }
}
