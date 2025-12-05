import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialGroup } from './entities/material-group.entity';
import { CreateMaterialGroupDto } from './dto/create-material-group.dto';
import { UpdateMaterialGroupDto } from './dto/update-material-group.dto';

@Injectable()
export class MaterialGroupService {
    constructor(
        @InjectRepository(MaterialGroup)
        private readonly repository: Repository<MaterialGroup>,
    ) { }

    async create(createMaterialGroupDto: CreateMaterialGroupDto) {
        const entity = this.repository.create(createMaterialGroupDto);
        return this.repository.save(entity);
    }

    findAll() {
        return this.repository.find();
    }

    findOne(id: number) {
        return this.repository.findOneBy({ group_id: id });
    }

    async update(id: number, updateMaterialGroupDto: UpdateMaterialGroupDto) {
        await this.repository.update(id, updateMaterialGroupDto);
        return this.findOne(id);
    }

    remove(id: number) {
        return this.repository.softDelete(id);
    }

}
