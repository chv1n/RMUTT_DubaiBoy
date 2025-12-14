import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ContainerTypeService } from './container-type.service';
import { CreateContainerTypeDto } from './dto/create-container-type.dto';
import { UpdateContainerTypeDto } from './dto/update-container-type.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums';

@Controller({
    path: 'container-types',
    version: '1'
})
export class ContainerTypeController {
    constructor(private readonly service: ContainerTypeService) { }


    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Post()
    async create(@Body() createContainerTypeDto: CreateContainerTypeDto) {
        const data = await this.service.create(createContainerTypeDto);
        return {
            message: 'เพิ่มประเภทบรรจุภัณฑ์สำเร็จ',
            data
        };
    }

    @Auth()
    @Get()
    findAll(@Query() query: BaseQueryDto) {
        return this.service.findAll(query);
    }

    @Auth()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateContainerTypeDto: UpdateContainerTypeDto) {
        const data = await this.service.update(id, updateContainerTypeDto);
        return {
            message: 'แก้ไขประเภทบรรจุภัณฑ์สำเร็จ',
            data
        };
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.service.remove(id);
        return {
            message: 'ลบประเภทบรรจุภัณฑ์สำเร็จ'
        };
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Put(':id/restore')
    async restore(@Param('id', ParseIntPipe) id: number) {
        await this.service.restore(id);
        return {
            message: 'กู้คืนประเภทบรรจุภัณฑ์สำเร็จ'
        };
    }
}
