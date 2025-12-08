import { Injectable } from '@nestjs/common';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { Repository } from 'typeorm';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';

@Injectable()
export class InventoryTransactionService {

  constructor(@InjectRepository(InventoryTransaction) private inventoryTransactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(MaterialInventory) private materialInventoryRepository: Repository<MaterialInventory>,
    @InjectRepository(WarehouseMaster) private warehouseMasterRepository: Repository<WarehouseMaster>
  ) { }

  async create(createInventoryTransactionDto: CreateInventoryTransactionDto) {

    const { warehouse_id, material_inventory_id } = createInventoryTransactionDto;

    const warehouse = await this.warehouseMasterRepository.findOne({ where: { id: warehouse_id } });
    const materialInventory = await this.materialInventoryRepository.findOne({ where: { id: material_inventory_id } });

    if (!warehouse || !materialInventory) {
      throw new Error('Warehouse or Material Inventory not found');
    }

    if (!warehouse.is_active) {
      throw new Error('Warehouse is not active');
    }



    return await this.inventoryTransactionRepository.save(createInventoryTransactionDto);
  }

  findAll() {
    return this.inventoryTransactionRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} inventoryTransaction`;
  }

  update(id: number, updateInventoryTransactionDto: UpdateInventoryTransactionDto) {
    return `This action updates a #${id} inventoryTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventoryTransaction`;
  }
}
