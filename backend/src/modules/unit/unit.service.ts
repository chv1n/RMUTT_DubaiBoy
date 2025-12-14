import { Injectable, NotFoundException } from '@nestjs/common';
import { ISoftDeletable } from '../../common/interfaces/soft-deletable.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialUnits } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { QueryHelper } from '../../common/helpers/query.helper';
import { CrudHelper } from '../../common/helpers/crud.helper';
import { SoftDeleteHelper } from '../../common/helpers/soft-delete.helper';
import { Role } from 'src/common/enums';
import { Auth } from 'src/common/decorators/auth.decorator';

@Injectable()
export class UnitService implements ISoftDeletable {
    constructor(
        @InjectRepository(MaterialUnits)
        private readonly repository: Repository<MaterialUnits>,
    ) { }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    async create(createUnitDto: CreateUnitDto) {
        const entity = this.repository.create(createUnitDto);
        return this.repository.save(entity);
    }

    @Auth()
    async findAll(query: BaseQueryDto) {
        return QueryHelper.paginate(this.repository, query, { sortField: 'unit_name' });
    }

    @Auth()
    findOne(id: number) {
        return this.repository.findOneBy({ unit_id: id });
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    async update(id: number, updateUnitDto: UpdateUnitDto) {
        return CrudHelper.update(this.repository, id, 'unit_id', updateUnitDto, 'ไม่พบหน่วยนับที่ต้องการแก้ไข');
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    async remove(id: number): Promise<void> {
        await SoftDeleteHelper.remove(this.repository, id, 'unit_id', 'ไม่พบข้อมูลที่ต้องการลบ');
    }

    @Auth(Role.ADMIN, Role.SUPER_ADMIN)
    async restore(id: number): Promise<void> {
        await SoftDeleteHelper.restore(this.repository, id, 'unit_id', 'ไม่พบข้อมูลที่ต้องการกู้คืน');
    }

}
