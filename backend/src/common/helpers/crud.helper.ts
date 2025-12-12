import { NotFoundException } from '@nestjs/common';
import { CreateProductPlanDto } from 'src/modules/product-plan/dto/create-product-plan.dto';
import { ProductPlan } from 'src/modules/product-plan/entities/product-plan.entity';
import { ObjectLiteral, Repository } from 'typeorm';

export class CrudHelper {
    static create(repository: Repository<ProductPlan>, createProductPlanDto: CreateProductPlanDto, arg2: string) {
      throw new Error('Method not implemented.');
    }
    static async update<T extends ObjectLiteral>(
        repository: Repository<T>,
        id: number,
        idField: keyof T,
        dto: any,
        notFoundMessage: string
    ) {
        const where: any = {};
        where[idField] = id;

        const entity = await repository.findOneBy(where);
        if (!entity) {
            throw new NotFoundException(notFoundMessage);
        }

        const updated = Object.assign(entity, dto);
        return repository.save(updated);
    }
}
