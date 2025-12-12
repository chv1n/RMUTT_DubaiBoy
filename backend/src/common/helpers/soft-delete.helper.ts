import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

export class SoftDeleteHelper {
    static async remove<T extends ObjectLiteral>(
        repository: Repository<T>,
        id: number,
        idField: keyof T,
        notFoundMessage: string
    ): Promise<void> {
        const where: any = {};
        where[idField] = id;

        const entity = await repository.findOneBy(where);
        if (!entity) {
            throw new NotFoundException(notFoundMessage);
        }
        await repository.softDelete(id);
    }

    static async restore<T extends ObjectLiteral>(
        repository: Repository<T>,
        id: number,
        idField: keyof T,
        notFoundMessage: string
    ): Promise<void> {
        const where: any = {};
        where[idField] = id;

        const entity = await repository.findOne({ where, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(notFoundMessage);
        }
        await repository.restore(id);
    }
}
