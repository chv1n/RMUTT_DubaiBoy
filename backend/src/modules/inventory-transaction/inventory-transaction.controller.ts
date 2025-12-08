import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialInventoryService } from '../material-inventory/material-inventory.service';


@Controller('inventory-transaction')
export class InventoryTransactionController {
  constructor(@InjectRepository(InventoryTransactionService) private readonly inventoryTransactionService: InventoryTransactionService,
    @InjectRepository(MaterialInventoryService) private readonly materialInventoryService: MaterialInventoryService
  ) { }

  @Post()
  create(@Body() createInventoryTransactionDto: CreateInventoryTransactionDto) {

    return this.inventoryTransactionService.create(createInventoryTransactionDto);
  }

  @Get()
  findAll(@Query() queryBase: BaseQueryDto) {
    return this.inventoryTransactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryTransactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventoryTransactionDto: UpdateInventoryTransactionDto) {
    return this.inventoryTransactionService.update(+id, updateInventoryTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryTransactionService.remove(+id);
  }
}
