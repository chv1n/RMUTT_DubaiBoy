import { Injectable } from '@nestjs/common';
import { CreateMaterialInventoryDto } from './dto/create-material-inventory.dto';
import { UpdateMaterialInventoryDto } from './dto/update-material-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialInventory } from './entities/material-inventory.entity';
import { Repository } from 'typeorm';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { MaterialInventoryDto } from 'src/common/dto/material-inventory-query.dto';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

@Injectable()
export class MaterialInventoryService {

  constructor(@InjectRepository(MaterialInventory) private materialInventoryRepository: Repository<MaterialInventory>,
    @InjectRepository(MaterialMaster) private materialRepository: Repository<MaterialMaster>,
    @InjectRepository(WarehouseMaster) private warehouseRepository: Repository<WarehouseMaster>,
    @InjectRepository(Supplier) private supplierRepository: Repository<Supplier>) { }

  async create(createMaterialInventoryDto: CreateMaterialInventoryDto) {

    const { material_id, warehouse_id, supplier_id } = createMaterialInventoryDto;

    const material = await this.materialRepository.findOne({
      where: { material_id: material_id }
    });
    const warehouse = await this.warehouseRepository.findOne({ where: { id: warehouse_id } });
    const supplier = await this.supplierRepository.findOne({ where: { supplier_id: supplier_id } });

    if (!material || !warehouse || !supplier) {
      throw new Error('Material, Warehouse, and Supplier not found');
    }

    if (!material.is_active || !warehouse.is_active || !supplier.is_active) {
      throw new Error('Material, Warehouse, and Supplier not active');
    }

    return await this.materialInventoryRepository.save({
      ...createMaterialInventoryDto,
      material,
      warehouse,
      supplier
    });
  }

  async findAll(baseQueryDto: BaseQueryDto, materialInventoryDto: MaterialInventoryDto) {
    const { material_id, warehouse_id, supplier_id } = materialInventoryDto;
    let { is_active, page, limit, sort_order } = baseQueryDto;

    if (!page) page = 1;
    if (!limit) limit = 10;
    if (!sort_order) sort_order = 'ASC';

    const qb = await this.materialInventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.material', 'material')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .leftJoinAndSelect('inventory.supplier', 'supplier')

    // Filters
    if (material_id) {
      qb.andWhere('material.material_id = :material_id', { material_id });
    }

    if (warehouse_id) {
      qb.andWhere('warehouse.warehouse_master_id = :warehouse_id', { warehouse_id });
    }

    if (supplier_id) {
      qb.andWhere('supplier.supplier_id = :supplier_id', { supplier_id });
    }

    if (is_active !== undefined) {
      qb.andWhere('inventory.is_active = :is_active', { is_active });
    }

    qb.orderBy('inventory.id', sort_order.toUpperCase() as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      page,
      limit,
      total,
      data,
    };
  }


  async findOne(id: number) {

    const qb = await this.materialInventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.material', 'material')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .leftJoinAndSelect('inventory.supplier', 'supplier')
      .where('inventory.id = :id', { id });

    const data = await qb.getOne();

    if (!data) {
      throw new Error('Material Inventory Not Found');
    }

    return data;
  }


  async update(id: number, dto: UpdateMaterialInventoryDto) {

    const inventory = await this.materialInventoryRepository.findOne({
      where: { id },
      relations: ['material', 'warehouse', 'supplier'],
    });

    if (!inventory) {
      throw new Error('Material Inventory Not Found');
    }

    // update material relation
    if (dto.material_id !== undefined) {
      inventory.material = await this.materialRepository.findOneOrFail({
        where: { material_id: dto.material_id }
      });
    }

    // update warehouse relation
    if (dto.warehouse_id !== undefined) {
      inventory.warehouse = await this.warehouseRepository.findOneOrFail({
        where: { id: dto.warehouse_id }
      });
    }

    // update supplier relation
    if (dto.supplier_id !== undefined) {
      inventory.supplier = await this.supplierRepository.findOneOrFail({
        where: { supplier_id: dto.supplier_id }
      });
    }

    // update normal fields
    Object.assign(inventory, dto);

    return await this.materialInventoryRepository.save(inventory);
  }




  remove(id: number) {

    const materialInventory = this.materialInventoryRepository.findOne({ where: { id } });

    if (!materialInventory) {
      throw new Error('Material Inventory Not Found');
    }

    return this.materialInventoryRepository.softDelete(id);
  }
}
