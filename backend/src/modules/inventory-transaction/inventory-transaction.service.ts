import { Injectable } from '@nestjs/common';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { Repository } from 'typeorm';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';
import { InventoryTransactionQueryDto } from 'src/common/dto/inventory-transaction-query.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

@Injectable()
export class InventoryTransactionService {

  constructor(@InjectRepository(InventoryTransaction) private readonly inventoryTransactionRepository: Repository<InventoryTransaction>,
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

    return await this.inventoryTransactionRepository.save({
      ...createInventoryTransactionDto,
      materialInventory,
      warehouse,
    });
  }

  async findAll(queryBase: BaseQueryDto, query: InventoryTransactionQueryDto) {
    const { page = 1, limit = 10, sort_order = 'ASC' } = queryBase;
    const { warehouse_id, material_inventory_id, transaction_type, transaction_date, reference_number } = query;

    const qb = this.inventoryTransactionRepository
      .createQueryBuilder('inventoryTransaction')
      .leftJoinAndSelect('inventoryTransaction.warehouse', 'warehouse')
      .leftJoinAndSelect('inventoryTransaction.materialInventory', 'materialInventory')
      .andWhere('inventoryTransaction.deleted_at IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('inventoryTransaction.id', sort_order.toUpperCase() as 'ASC' | 'DESC');

    if (warehouse_id) {
      qb.andWhere('inventoryTransaction.warehouse_id = :warehouse_id', { warehouse_id });
    }

    if (material_inventory_id) {
      qb.andWhere('inventoryTransaction.material_inventory_id = :material_inventory_id', { material_inventory_id });
    }

    if (transaction_type) {
      qb.andWhere('inventoryTransaction.transaction_type = :transaction_type', { transaction_type });
    }

    if (transaction_date) {
      qb.andWhere('inventoryTransaction.transaction_date = :transaction_date', { transaction_date });
    }

    if (reference_number) {
      qb.andWhere('inventoryTransaction.reference_number = :reference_number', {
        reference_number,
      });
    }

    return qb.getMany();
  }


  async findOne(id: number) {
    const data = await this.inventoryTransactionRepository
      .createQueryBuilder('inventoryTransaction')
      .leftJoinAndSelect('inventoryTransaction.warehouse', 'warehouse')
      .leftJoinAndSelect('inventoryTransaction.materialInventory', 'materialInventory')
      .where('inventoryTransaction.id = :id', { id })
      .andWhere('inventoryTransaction.deleted_at IS NULL')
      .getOne();

    if (!data) {
      return null
    }

    return data;
  }

  async update(id: number, updateInventoryTransactionDto: UpdateInventoryTransactionDto) {

    const inventory = await this.inventoryTransactionRepository.findOne({
      where: { id },
      relations: ['materialInventory', 'warehouse'],
    });

    if (!inventory) {
      return null;
    }

    // update material relation
    if (updateInventoryTransactionDto.material_inventory_id !== undefined) {
      inventory.materialInventory = await this.materialInventoryRepository.findOneOrFail({
        where: { id: updateInventoryTransactionDto.material_inventory_id }
      });
    }

    // update warehouse relation
    if (updateInventoryTransactionDto.warehouse_id !== undefined) {
      inventory.warehouse = await this.warehouseMasterRepository.findOneOrFail({
        where: { id: updateInventoryTransactionDto.warehouse_id }
      });
    }

    // update normal fields
    Object.assign(inventory, updateInventoryTransactionDto);

    return await this.inventoryTransactionRepository.save(inventory);
  }

  async remove(id: number) {
    const inventory = await this.inventoryTransactionRepository.findOne({ where: { id } });
    if (!inventory) {
      return null
    }
    return this.inventoryTransactionRepository.softDelete(id);
  }
}
