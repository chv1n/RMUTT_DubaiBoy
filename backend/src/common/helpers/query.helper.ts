import { ObjectLiteral, Repository } from 'typeorm';
import { BaseQueryDto } from '../dto/base-query.dto';

export class QueryHelper {
    static async paginate<T extends ObjectLiteral>(
        repository: Repository<T>,
        query: BaseQueryDto,
        options: { sortField: string }
    ) {
        const { is_active, sort_order } = query;
        const page = query.page || 1;
        const limit = query.limit || 20;

        const where: any = {};

        if (is_active !== undefined) {
            where.is_active = is_active;
        }

        const order: any = {};
        order[options.sortField] = sort_order === 'DESC' ? 'DESC' : 'ASC';

        const [items, total] = await repository.findAndCount({
            where,
            order,
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: items,
            meta: {
                totalItems: total,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }
}
