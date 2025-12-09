import { Injectable } from '@nestjs/common';
import { CreateProductPlanDto } from './dto/create-product-plan.dto';
import { UpdateProductPlanDto } from './dto/update-product-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPlan } from './entities/product-plan.entity';
import { Repository } from 'typeorm';
import { CrudHelper } from 'src/common/helpers/crud.helper';
import { ISoftDeletable } from 'src/common/interfaces/soft-deletable.interface';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { QueryHelper } from 'src/common/helpers/query.helper';
import { SoftDeleteHelper } from 'src/common/helpers/soft-delete.helper';

@Injectable()
export class ProductPlanService implements ISoftDeletable {

  constructor(@InjectRepository(ProductPlan) private readonly repository: Repository<ProductPlan>) { }

  async create(createProductPlanDto: CreateProductPlanDto) {
    const { product_id, ...rest } = createProductPlanDto;
    // Map product_id to relation, ensuring correct structure if DTO has raw ID
    const entity = this.repository.create({
      ...rest,
      product: { product_id: product_id } as any // Handle relation mapping
    });
    return this.repository.save(entity);
  }

  async findAll(query: BaseQueryDto) {
    return QueryHelper.paginate(this.repository, query, {
      relations: ['product'],
      sortField: 'plan_id', // PK is plan_id
    });
  }

  async findOne(id: number) {
    return await this.repository.findOne({
      where: { id },
      relations: ['product']
    });
  }

  async update(id: number, updateProductPlanDto: UpdateProductPlanDto) {
    const { product_id, ...rest } = updateProductPlanDto;
    const updateData: any = { ...rest };
    if (product_id) {
      updateData.product = { product_id };
    }
    return CrudHelper.update(this.repository, id, 'id', updateData, 'ProductPlan not found'); // PK is plan_id? Wait, entity says id: number with @PrimaryGeneratedColumn({ name: 'plan_id' }). Property name is 'id'. Column name is 'plan_id'.
    // CrudHelper.update takes 'idField' which is the PROPERTY name in Entity to query by? No, usually it builds a where clause.
    // CrudHelper signature: update(repo, id, idField, data, msg).
    // Let's check CrudHelper.update implementation in 'src/common/helpers/crud.helper.ts' later or assume 'id'.
    // Entity: id: number. So use 'id'.
  }

  async remove(id: number) {
    await SoftDeleteHelper.remove(this.repository, id, 'id', 'ProductPlan not found');
  }

  async restore(id: number) {
    await SoftDeleteHelper.restore(this.repository, id, 'id', 'ProductPlan not found');
  }
}
