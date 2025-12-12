import { Injectable, NotFoundException } from '@nestjs/common';
import { ISoftDeletable } from '../../common/interfaces/soft-deletable.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialGroup } from './entities/material-group.entity';
import { CreateMaterialGroupDto } from './dto/create-material-group.dto';
import { UpdateMaterialGroupDto } from './dto/update-material-group.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { QueryHelper } from '../../common/helpers/query.helper';
import { CrudHelper } from '../../common/helpers/crud.helper';
import { SoftDeleteHelper } from '../../common/helpers/soft-delete.helper';

@Injectable()
export class MaterialGroupService implements ISoftDeletable {
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
        return this.repository.findOneBy({ group_id: id });
    }

    async update(id: number, updateMaterialGroupDto: UpdateMaterialGroupDto) {
        return CrudHelper.update(this.repository, id, 'group_id', updateMaterialGroupDto, 'ไม่พบกลุ่มวัตถุดิบที่ต้องการแก้ไข');
    }

    async remove(id: number): Promise<void> {
        await SoftDeleteHelper.remove(this.repository, id, 'group_id', 'ไม่พบข้อมูลที่ต้องการลบ');
    }

    async restore(id: number): Promise<void> {
        await SoftDeleteHelper.restore(this.repository, id, 'group_id', 'ไม่พบข้อมูลที่ต้องการกู้คืน');
    }
}
