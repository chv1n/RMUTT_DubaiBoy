import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateWarehouseMasterDto } from './dto/create-warehouse-master.dto';
import { UpdateWarehouseMasterDto } from './dto/update-warehouse-master.dto';
import { WarehouseMaster } from './entities/warehouse-master.entity';
import { WarehouseMasterQueryDto } from './dto/warehouse-master-query.dto';
import { ISoftDeletable } from '../../common/interfaces/soft-deletable.interface';
import { SoftDeleteHelper } from '../../common/helpers/soft-delete.helper';
import { CrudHelper } from '../../common/helpers/crud.helper';

@Injectable()
export class WarehouseMasterService implements ISoftDeletable {

  constructor(
    @InjectRepository(WarehouseMaster)
    private readonly warehouseMasterRepository: Repository<WarehouseMaster>
  ) { }

  async create(createWarehouseMasterDto: CreateWarehouseMasterDto) {
    const warehouseMaster = this.warehouseMasterRepository.create(createWarehouseMasterDto);
    return await this.warehouseMasterRepository.save(warehouseMaster);
  }

  async findAll(query: WarehouseMasterQueryDto) {
    const qb = this.createBaseQuery();

    this.applyStandardFilters(qb, query);
    this.applySearch(qb, query.search);
    this.applySorting(qb, query.sort_by, query.sort_order);

    return this.paginateAndRespond(qb, query);
  }

  async findOne(id: number) {
    const warehouse = await this.warehouseMasterRepository.findOneBy({ id: id } as any);

    if (!warehouse) {
      throw new NotFoundException(`Warehouse Master with ID ${id} not found`);
    }

    return warehouse;
  }

  async update(id: number, updateWarehouseMasterDto: UpdateWarehouseMasterDto) {
    return await CrudHelper.update(
      this.warehouseMasterRepository,
      id,
      'id',
      updateWarehouseMasterDto,
      'Warehouse Master not found'
    );
  }

  async remove(id: number): Promise<void> {
    await SoftDeleteHelper.remove(this.warehouseMasterRepository, id, 'id', 'Warehouse Master not found');
  }

  async restore(id: number): Promise<void> {
    await SoftDeleteHelper.restore(this.warehouseMasterRepository, id, 'id', 'Warehouse Master not found');
  }

  private createBaseQuery(): SelectQueryBuilder<WarehouseMaster> {
    return this.warehouseMasterRepository.createQueryBuilder('warehouseMaster');
  }

  private applyStandardFilters(qb: SelectQueryBuilder<WarehouseMaster>, query: WarehouseMasterQueryDto) {
    if (query.is_active !== undefined) {
      qb.andWhere('warehouseMaster.is_active = :is_active', { is_active: query.is_active });
    }

    if (query.warehouse_id) {
      qb.andWhere('warehouseMaster.warehouse_id = :warehouse_id', { warehouse_id: query.warehouse_id });
    }

    if (query.warehouse_name) {
      qb.andWhere('warehouseMaster.warehouse_name = :warehouse_name', { warehouse_name: query.warehouse_name });
    }

    if (query.warehouse_address) {
      qb.andWhere('warehouseMaster.warehouse_address = :warehouse_address', { warehouse_address: query.warehouse_address });
    }

    if (query.warehouse_phone) {
      qb.andWhere('warehouseMaster.warehouse_phone = :warehouse_phone', { warehouse_phone: query.warehouse_phone });
    }

    if (query.warehouse_email) {
      qb.andWhere('warehouseMaster.warehouse_email = :warehouse_email', { warehouse_email: query.warehouse_email });
    }
  }

  private applySearch(qb: SelectQueryBuilder<WarehouseMaster>, search?: string) {
    if (search) {
      qb.andWhere(
        '(warehouseMaster.warehouse_name ILIKE :search OR warehouseMaster.warehouse_address ILIKE :search OR warehouseMaster.warehouse_email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
  }

  private applySorting(qb: SelectQueryBuilder<WarehouseMaster>, sortBy?: string, sortOrder: string = 'desc') {
    if (sortBy) {
      qb.orderBy(`warehouseMaster.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('warehouseMaster.updated_at', 'DESC');
    }
  }

  private async paginateAndRespond(qb: SelectQueryBuilder<WarehouseMaster>, query: WarehouseMasterQueryDto) {
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
