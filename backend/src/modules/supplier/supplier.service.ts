import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { QueryHelper } from '../../common/helpers/query.helper';
import { CrudHelper } from '../../common/helpers/crud.helper';

@Injectable()
export class SupplierService {
    constructor(
        @InjectRepository(Supplier)
        private readonly repository: Repository<Supplier>,
    ) { }

    async create(createSupplierDto: CreateSupplierDto) {
        const entity = this.repository.create(createSupplierDto);
        return this.repository.save(entity);
    }

    async findAll(query: BaseQueryDto) {
        return QueryHelper.paginate(this.repository, query, { sortField: 'supplier_name' });
    }

    findOne(id: number) {
        return this.repository.findOneBy({ supplier_id: id, is_active: true });
    }

    async update(id: number, updateSupplierDto: UpdateSupplierDto) {
        return CrudHelper.update(this.repository, id, 'supplier_id', updateSupplierDto, 'ไม่พบรายการที่ต้องการแก้ไข');
    }

}
