import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialInventoryService } from '../material-inventory/material-inventory.service';
import { InventoryTransactionQueryDto } from 'src/common/dto/inventory-transaction-query.dto';


@Controller({
  path: 'inventory-transaction',
  version: '1'
})
export class InventoryTransactionController {
  constructor(private readonly inventoryTransactionService: InventoryTransactionService,
  ) { }

  @Post()
  create(@Body() createInventoryTransactionDto: CreateInventoryTransactionDto) {

    return this.inventoryTransactionService.create(createInventoryTransactionDto);
  }

  @Get()
  findAll(@Query() queryBase: BaseQueryDto, @Query() query: InventoryTransactionQueryDto) {
    return this.inventoryTransactionService.findAll(queryBase, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryTransactionService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateInventoryTransactionDto: UpdateInventoryTransactionDto) {
    return this.inventoryTransactionService.update(+id, updateInventoryTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryTransactionService.remove(+id);
  }
}
