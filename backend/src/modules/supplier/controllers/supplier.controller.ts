import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SupplierService } from '../services/supplier.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { Role } from 'src/common/enums';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller({
    path: 'suppliers',
    version: '1'
})
export class SupplierController {
    constructor(private readonly service: SupplierService) { }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    @Post()
    async create(@Body() createSupplierDto: CreateSupplierDto) {
        const data = await this.service.create(createSupplierDto);
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
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
        const data = await this.service.update(id, updateSupplierDto);
        return {
            message: 'แก้ไขสำเร็จ',
            data
        };
    }

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
