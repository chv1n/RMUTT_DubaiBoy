import { Injectable, NotFoundException } from '@nestjs/common';
import { ISoftDeletable } from '../../common/interfaces/soft-deletable.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, LessThan, MoreThan } from 'typeorm';
import { MaterialMaster } from './entities/material-master.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialQueryDto } from './dto/material-query.dto';
import { SoftDeleteHelper } from '../../common/helpers/soft-delete.helper';

import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { WarehouseMaster } from '../warehouse-master/entities/warehouse-master.entity';

@Injectable()
export class MaterialService implements ISoftDeletable {
  constructor(
    @InjectRepository(MaterialMaster)
    private readonly materialRepository: Repository<MaterialMaster>,
    @InjectRepository(MaterialInventory)
    private readonly materialInventoryRepository: Repository<MaterialInventory>,
    @InjectRepository(WarehouseMaster)
    private readonly warehouseRepository: Repository<WarehouseMaster>,
  ) { }

  async create(createMaterialDto: CreateMaterialDto) {
    const material = this.materialRepository.create(createMaterialDto);
    const savedMaterial = await this.materialRepository.save(material);

    // Create default inventory
    const warehouse = await this.warehouseRepository.findOne({ where: { is_active: true } });
    if (warehouse) {
      const inventory = this.materialInventoryRepository.create({
        material: savedMaterial,
        warehouse: warehouse,
        quantity: 0,
      });
      await this.materialInventoryRepository.save(inventory);
    }

    return savedMaterial;
  }

  async findAll(query: MaterialQueryDto) {
    const qb = this.createBaseQuery();

    this.applyStandardFilters(qb, query);
    this.applySearch(qb, query.search);
    this.applyDateFilters(qb, query);
    this.applySorting(qb, query.sort_by, query.sort_order);

    return this.paginateAndRespond(qb, query);
  }

  async findOne(id: number) {
    const material = await this.materialRepository.findOne({
      where: { material_id: id },
      relations: ['material_group', 'container_type', 'unit', 'supplier'],
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.materialRepository.findOneBy({ material_id: id });
    if (!material) {
      throw new NotFoundException(`ไม่พบวัสดุที่ต้องการแก้ไข`);
    }
    const updated = Object.assign(material, updateMaterialDto);
    const result = await this.materialRepository.save(updated);
    return result;
  }

  async remove(id: number): Promise<void> {
    await SoftDeleteHelper.remove(this.materialRepository, id, 'material_id', 'ไม่พบวัสดุที่ต้องการลบ');
  }

  async restore(id: number): Promise<void> {
    await SoftDeleteHelper.restore(this.materialRepository, id, 'material_id', 'ไม่พบวัสดุที่ต้องการกู้คืน');
  }

  private createBaseQuery(): SelectQueryBuilder<MaterialMaster> {
    return this.materialRepository.createQueryBuilder('material')
      .leftJoinAndSelect('material.material_group', 'material_group')
      .leftJoinAndSelect('material.container_type', 'container_type')
      .leftJoinAndSelect('material.unit', 'unit')
      .leftJoinAndSelect('material.supplier', 'supplier');

  }

  private applyStandardFilters(qb: SelectQueryBuilder<MaterialMaster>, query: MaterialQueryDto) {
    const filterMap = {
      material_id: 'material.material_id = :material_id',
      material_group_id: 'material.material_group_id = :material_group_id',
      container_type_id: 'material.container_type_id = :container_type_id',
      unit_id: 'material.unit_id = :unit_id',
      is_active: 'material.is_active = :is_active',
    };

    Object.entries(filterMap).forEach(([key, condition]) => {
      if (query[key] !== undefined) {
        qb.andWhere(condition, { [key]: query[key] });
      }
    });
  }

  private applySearch(qb: SelectQueryBuilder<MaterialMaster>, search?: string) {
    if (search) {
      qb.andWhere('material.material_name ILIKE :search', { search: `%${search}%` });
    }
  }

  private applyDateFilters(qb: SelectQueryBuilder<MaterialMaster>, query: MaterialQueryDto) {
    const dateFilters = {
      expiration_before: { cond: 'material.expiration_date < :expiration_before', val: query.expiration_before },
      expiration_after: { cond: 'material.expiration_date > :expiration_after', val: query.expiration_after },
      updated_before: { cond: 'material.update_date < :updated_before', val: query.updated_before },
      updated_after: { cond: 'material.update_date > :updated_after', val: query.updated_after },
    };

    Object.entries(dateFilters).forEach(([key, { cond, val }]) => {
      if (val) qb.andWhere(cond, { [key]: val });
    });
  }

  private applySorting(qb: SelectQueryBuilder<MaterialMaster>, sortBy?: string, sortOrder: string = 'desc') {
    if (sortBy) {
      qb.orderBy(`material.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('material.update_date', 'DESC');
    }
  }

  private async paginateAndRespond(qb: SelectQueryBuilder<MaterialMaster>, query: MaterialQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
}
