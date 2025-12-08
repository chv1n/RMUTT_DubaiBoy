import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialGroup } from './entities/material-group.entity';
import { CreateMaterialGroupDto } from './dto/create-material-group.dto';
import { UpdateMaterialGroupDto } from './dto/update-material-group.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { QueryHelper } from '../../common/helpers/query.helper';
import { CrudHelper } from '../../common/helpers/crud.helper';

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

    async findAll(query: BaseQueryDto) {
        return QueryHelper.paginate(this.repository, query, { sortField: 'group_name' });
    }

    findOne(id: number) {
        return this.repository.findOneBy({ group_id: id, is_active: true });
    }

    async update(id: number, updateMaterialGroupDto: UpdateMaterialGroupDto) {
        return CrudHelper.update(this.repository, id, 'group_id', updateMaterialGroupDto, 'ไม่พบกลุ่มวัตถุดิบที่ต้องการแก้ไข');
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        if (entity) {
            await this.repository.update(id, { is_active: false });
        }
    }
}
