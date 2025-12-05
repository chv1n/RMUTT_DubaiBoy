import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

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

    findAll() {
        return this.repository.find();
    }

    findOne(id: number) {
        return this.repository.findOneBy({ supplier_id: id });
    }

    async update(id: number, updateSupplierDto: UpdateSupplierDto) {
        await this.repository.update(id, updateSupplierDto);
        return this.findOne(id);
    }

    remove(id: number) {
        return this.repository.softDelete(id);
    }
}
