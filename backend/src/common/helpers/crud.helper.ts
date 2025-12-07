import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

export class CrudHelper {
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
