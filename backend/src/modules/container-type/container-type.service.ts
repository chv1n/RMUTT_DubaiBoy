import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialContainerType } from './entities/container-type.entity';
import { CreateContainerTypeDto } from './dto/create-container-type.dto';
import { UpdateContainerTypeDto } from './dto/update-container-type.dto';

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

    findAll() {
        return this.repository.find();
    }

    findOne(id: number) {
        return this.repository.findOneBy({ type_id: id });
    }

    async update(id: number, updateContainerTypeDto: UpdateContainerTypeDto) {
        await this.repository.update(id, updateContainerTypeDto);
        return this.findOne(id);
    }


}
