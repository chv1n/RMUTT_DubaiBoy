import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ContainerTypeService } from './container-type.service';
import { CreateContainerTypeDto } from './dto/create-container-type.dto';
import { UpdateContainerTypeDto } from './dto/update-container-type.dto';

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
    findAll() {
        return this.service.findAll();
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

}
