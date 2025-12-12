import { Injectable, NotFoundException } from '@nestjs/common';
import { ISoftDeletable } from '../../common/interfaces/soft-deletable.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialContainerType } from './entities/container-type.entity';
import { CreateContainerTypeDto } from './dto/create-container-type.dto';
import { UpdateContainerTypeDto } from './dto/update-container-type.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { QueryHelper } from '../../common/helpers/query.helper';
import { CrudHelper } from '../../common/helpers/crud.helper';
import { SoftDeleteHelper } from '../../common/helpers/soft-delete.helper';

@Injectable()
export class ContainerTypeService implements ISoftDeletable {
    constructor(
        @InjectRepository(MaterialContainerType)
        private readonly repository: Repository<MaterialContainerType>,
    ) { }

    async create(createContainerTypeDto: CreateContainerTypeDto) {
        const entity = this.repository.create(createContainerTypeDto);
        return this.repository.save(entity);
    }

    async findAll(query: BaseQueryDto) {
        return QueryHelper.paginate(this.repository, query, { sortField: 'type_name' });
    }

    findOne(id: number) {
        return this.repository.findOne({ where: { type_id: id } });
    }

    async update(id: number, updateContainerTypeDto: UpdateContainerTypeDto) {
        return CrudHelper.update(this.repository, id, 'type_id', updateContainerTypeDto, 'ไม่พบออบเจ็กต์ที่ต้องการแก้ไข');
    }

    async remove(id: number): Promise<void> {
        await SoftDeleteHelper.remove(this.repository, id, 'type_id', 'ไม่พบข้อมูลที่ต้องการลบ');
    }

    async restore(id: number): Promise<void> {
        await SoftDeleteHelper.restore(this.repository, id, 'type_id', 'ไม่พบข้อมูลที่ต้องการกู้คืน');
    }
}
