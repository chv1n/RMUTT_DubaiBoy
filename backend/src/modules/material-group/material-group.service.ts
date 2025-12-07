import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialGroup } from './entities/material-group.entity';
import { CreateMaterialGroupDto } from './dto/create-material-group.dto';
import { UpdateMaterialGroupDto } from './dto/update-material-group.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

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

    findAll(query: BaseQueryDto) {
        const { is_active, sort_order } = query;
        const where: any = {};

        if (is_active !== undefined) {
            where.is_active = is_active;
        }

        console.log(where);

        return this.repository.find({
            where,
            order: {
                group_name: sort_order === 'DESC' ? 'DESC' : 'ASC',
            },
        });
    }

    findOne(id: number) {
        return this.repository.findOneBy({ group_id: id, is_active: true });
    }

    async update(id: number, updateMaterialGroupDto: UpdateMaterialGroupDto) {
        const materialGroup = await this.findOne(id);
        if (!materialGroup) {
            throw new Error('Material group not found');
        }
        const updated = Object.assign(materialGroup, updateMaterialGroupDto);
        return this.repository.save(updated);
    }

}
