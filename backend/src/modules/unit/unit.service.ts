import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialUnits } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
    constructor(
        @InjectRepository(MaterialUnits)
        private readonly repository: Repository<MaterialUnits>,
    ) { }

    async create(createUnitDto: CreateUnitDto) {
        const entity = this.repository.create(createUnitDto);
        return this.repository.save(entity);
    }

    findAll() {
        return this.repository.find();
    }

    findOne(id: number) {
        return this.repository.findOneBy({ unit_id: id });
    }

    async update(id: number, updateUnitDto: UpdateUnitDto) {
        await this.repository.update(id, updateUnitDto);
        return this.findOne(id);
    }

    remove(id: number) {
        return this.repository.softDelete(id);
    }
}
