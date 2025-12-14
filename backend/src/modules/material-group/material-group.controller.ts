import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { MaterialGroupService } from './material-group.service';
import { CreateMaterialGroupDto } from './dto/create-material-group.dto';
import { UpdateMaterialGroupDto } from './dto/update-material-group.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { Role } from 'src/common/enums';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller({
    path: 'material-groups',
    version: '1'
})
export class MaterialGroupController {
    constructor(private readonly service: MaterialGroupService) { }


    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Post()
    async create(@Body() createMaterialGroupDto: CreateMaterialGroupDto) {
        const data = await this.service.create(createMaterialGroupDto);
        return {
            message: 'เพิ่มสำเร็จ',
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
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateMaterialGroupDto: UpdateMaterialGroupDto) {
        const data = await this.service.update(id, updateMaterialGroupDto);
        return {
            message: 'แก้ไขสำเร็จ',
            data
        };
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.service.remove(id);
        return {
            message: 'ลบสำเร็จ'
        };
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Put(':id/restore')
    async restore(@Param('id', ParseIntPipe) id: number) {
        await this.service.restore(id);
        return {
            message: 'กู้คืนสำเร็จ'
        };
    }
}
