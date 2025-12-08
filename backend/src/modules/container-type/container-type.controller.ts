import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ContainerTypeService } from './container-type.service';
import { CreateContainerTypeDto } from './dto/create-container-type.dto';
import { UpdateContainerTypeDto } from './dto/update-container-type.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

@Controller({
    path: 'container-types',
    version: '1'
})
export class ContainerTypeController {
    constructor(private readonly service: ContainerTypeService) { }

    @Post()
    async create(@Body() createContainerTypeDto: CreateContainerTypeDto) {
        const data = await this.service.create(createContainerTypeDto);
        return {
            message: 'เพิ่มประเภทบรรจุภัณฑ์สำเร็จ',
            data
        };
    }

    @Get()
    findAll(@Query() query: BaseQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateContainerTypeDto: UpdateContainerTypeDto) {
        const data = await this.service.update(id, updateContainerTypeDto);
        return {
            message: 'แก้ไขประเภทบรรจุภัณฑ์สำเร็จ',
            data
        };
    }


    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.service.remove(id);
        return {
            message: 'ลบประเภทบรรจุภัณฑ์สำเร็จ'
        };
    }

    @Put(':id/restore')
    async restore(@Param('id', ParseIntPipe) id: number) {
        await this.service.restore(id);
        return {
            message: 'กู้คืนประเภทบรรจุภัณฑ์สำเร็จ'
        };
    }
}
