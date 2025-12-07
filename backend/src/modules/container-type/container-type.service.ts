import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialContainerType } from './entities/container-type.entity';
import { CreateContainerTypeDto } from './dto/create-container-type.dto';
import { UpdateContainerTypeDto } from './dto/update-container-type.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { QueryHelper } from '../../common/helpers/query.helper';
import { CrudHelper } from '../../common/helpers/crud.helper';

@Injectable()
export class ContainerTypeService {
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
        return this.repository.findOne({ where: { type_id: id, is_active: true } });
    }

    async update(id: number, updateContainerTypeDto: UpdateContainerTypeDto) {
        return CrudHelper.update(this.repository, id, 'type_id', updateContainerTypeDto, 'ไม่พบวัสดุที่ต้องการแก้ไข');
    }

}
