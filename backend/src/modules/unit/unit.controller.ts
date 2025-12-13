import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller({
    path: 'units',
    version: '1'
})
export class UnitController {
    constructor(private readonly service: UnitService) { }

    @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Post()
    async create(@Body() createUnitDto: CreateUnitDto) {
        const data = await this.service.create(createUnitDto);
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
    findOne(@Param('id') id: number) {
        return this.service.findOne(+id);
    }

    @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Put(':id')
    async update(@Param('id') id: number, @Body() updateUnitDto: UpdateUnitDto) {
        const data = await this.service.update(+id, updateUnitDto);
        return {
            message: 'แก้ไขสำเร็จ',
            data
        };
    }


    @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.service.remove(id);
        return {
            message: 'ลบหน่วยนับสำเร็จ'
        };
    }

    @Auth(Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
    @Put(':id/restore')
    async restore(@Param('id', ParseIntPipe) id: number) {
        await this.service.restore(id);
        return {
            message: 'กู้คืนหน่วยนับสำเร็จ'
        };
    }
}

