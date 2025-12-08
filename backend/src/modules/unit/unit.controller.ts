import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

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
            message: 'เพิ่มสำเร็จ',
            data
        };
    }

    @Get()
    findAll(@Query() query: BaseQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.service.findOne(+id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateUnitDto: UpdateUnitDto) {
        const data = await this.service.update(+id, updateUnitDto);
        return {
            message: 'แก้ไขสำเร็จ',
            data
        };
    }


    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.service.remove(id);
        return {
            message: 'ลบหน่วยนับสำเร็จ'
        };
    }

    @Put(':id/restore')
    async restore(@Param('id', ParseIntPipe) id: number) {
        await this.service.restore(id);
        return {
            message: 'กู้คืนหน่วยนับสำเร็จ'
        };
    }
}
