import { Injectable } from '@nestjs/common';
import { CreateWarehouseMasterDto } from './dto/create-warehouse-master.dto';
import { UpdateWarehouseMasterDto } from './dto/update-warehouse-master.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WarehouseMaster } from './entities/warehouse-master.entity';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { object } from 'joi';
import { WarehouseDto } from 'src/common/dto/warehouse-query.dto';

@Injectable()
export class WarehouseMasterService {

  constructor(@InjectRepository(WarehouseMaster) private readonly warehouseMasterRepository: Repository<WarehouseMaster>) { }

  async create(createWarehouseMasterDto: CreateWarehouseMasterDto) {
    return await this.warehouseMasterRepository.save(createWarehouseMasterDto);
  }

  async findAll(baseQueryDto: BaseQueryDto, warehouseDto: WarehouseDto) {

    let { is_active, page, limit, sort_order } = baseQueryDto;
    const { warehouse_id, warehouse_name, warehouse_address, warehouse_phone, warehouse_email } = warehouseDto

    console.log(warehouseDto)

    const qb = this.warehouseMasterRepository.createQueryBuilder('warehouseMaster')

    if (is_active !== undefined) {
      qb.andWhere('warehouseMaster.is_active = :is_active', { is_active });
    }

    if (warehouse_id !== undefined) {
      qb.andWhere('warehouseMaster.warehouse_id = :warehouse_id', { warehouse_id });
    }

    if (warehouse_name !== undefined) {
      qb.andWhere('warehouseMaster.warehouse_name = :warehouse_name', { warehouse_name });
    }

    if (warehouse_address !== undefined) {
      qb.andWhere('warehouseMaster.warehouse_address = :warehouse_address', { warehouse_address });
    }

    if (warehouse_phone !== undefined) {
      qb.andWhere('warehouseMaster.warehouse_phone = :warehouse_phone', { warehouse_phone });
    }

    if (warehouse_email !== undefined) {
      qb.andWhere('warehouseMaster.warehouse_email = :warehouse_email', { warehouse_email });
    }

    if (!sort_order) {
      qb.orderBy('warehouseMaster.id', 'ASC');
    } else {
      qb.orderBy('warehouseMaster.id', sort_order.toUpperCase() as 'ASC' | 'DESC');
    }

    if (!limit) {
      limit = 10;
    }

    if (!page) {
      page = 1;
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      page,
      limit,
      total,
      data
    };


  }

  async findOne(id: number) {

    const warehouse = await this.warehouseMasterRepository.findOneBy({ id });

    if (!warehouse) {
      throw new Error('Warehouse Master Not Found');
    }

    return warehouse;
  }

  async update(id: number, updateWarehouseMasterDto: UpdateWarehouseMasterDto) {

    const warehouseMaster = await this.warehouseMasterRepository.findOneBy({ id });

    if (!warehouseMaster) {
      throw new Error('Warehouse Master Not Found');
    }

    return await this.warehouseMasterRepository.update(id, updateWarehouseMasterDto);
  }

  async remove(id: number) {

    const warehouse = await this.warehouseMasterRepository.findOneBy({ id });

    if (!warehouse) {
      throw new Error('Warehouse Master Not Found');
    }

    return await this.warehouseMasterRepository.softDelete({ id });
  }
}
