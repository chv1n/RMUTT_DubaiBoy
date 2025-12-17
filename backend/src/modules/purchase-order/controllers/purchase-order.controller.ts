import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from '../dto/purchase-order.dto';

@Controller('purchase-orders')
export class PurchaseOrderController {
    constructor(private readonly poService: PurchaseOrderService) { }

    @Post()
    create(@Body() createDto: CreatePurchaseOrderDto) {
        return this.poService.create(createDto);
    }

    @Post('seed')
    seed() {
        return this.poService.seed();
    }

    @Get()
    findAll() {
        return this.poService.findAll();
    }

    @Get('recommendations')
    getRecommendations() {
        return this.poService.getRecommendations();
    }

    @Get('check-impact/:id')
    checkImpact(@Param('id') id: string, @Query('date') date: string) {
        return this.poService.checkImpact(+id, date);
    }

    @Get('supplier-performance/:id')
    getSupplierPerformance(@Param('id') id: string) {
        return this.poService.getSupplierPerformance(+id);
    }

    @Get('alternatives/:supplierId')
    getAlternativeSuppliers(@Param('supplierId') supplierId: string) {
        return this.poService.getAlternativeSuppliers(+supplierId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.poService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderDto) {
        return this.poService.update(+id, updateDto);
    }
}
