import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller({
    path: 'suppliers',
    version: '1'
})
export class SupplierController {
    constructor(private readonly service: SupplierService) { }

    @Post()
    async create(@Body() createSupplierDto: CreateSupplierDto) {
        const data = await this.service.create(createSupplierDto);
        return {
            message: 'เพิ่มสำเร็จ',
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
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
        const data = await this.service.update(id, updateSupplierDto);
        return {
            message: 'แก้ไขสำเร็จ',
            data
        };
    }


}
