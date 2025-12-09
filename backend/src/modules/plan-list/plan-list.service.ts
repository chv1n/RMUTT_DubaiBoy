import { Injectable } from '@nestjs/common';
import { CreatePlanListDto } from './dto/create-plan-list.dto';
import { UpdatePlanListDto } from './dto/update-plan-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanList } from './entities/plan-list.entity';
import { Repository } from 'typeorm';
import { CrudHelper } from 'src/common/helpers/crud.helper';
import { ISoftDeletable } from 'src/common/interfaces/soft-deletable.interface';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { QueryHelper } from 'src/common/helpers/query.helper';
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper';

@Injectable()
export class PlanListService implements ISoftDeletable {

  constructor(@InjectRepository(PlanList) private readonly repository: Repository<PlanList>) { }

  async create(createPlanListDto: CreatePlanListDto) {
    const entity = this.repository.create(createPlanListDto);
    return this.repository.save(entity);
  }

  async findAll(query: BaseQueryDto) {
    return QueryHelper.paginate(this.repository, query, {
      relations: ['plan'],
      sortField: 'plan_id',
    });
  }

  async findOne(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: ['plan']
    });
  }

  async update(id: number, updatePlanListDto: UpdatePlanListDto) {
    return CrudHelper.update(this.repository, id, 'id', updatePlanListDto, 'PlanList not found');
  }

  async remove(id: number) {
    await SoftDeleteHelper.remove(this.repository, id, 'id', 'PlanList not found');
  }

  async restore(id: number) {
    await SoftDeleteHelper.restore(this.repository, id, 'id', 'PlanList not found');
  }
}
