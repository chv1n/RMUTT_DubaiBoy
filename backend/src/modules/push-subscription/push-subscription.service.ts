import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PushSubscription } from './entities/push-subscription.entity';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { PushSubscriptionQueryDto } from './dto/push-subscription-query.dto';
import { ISoftDeletable } from '../../common/interfaces/soft-deletable.interface';
import { SoftDeleteHelper } from '../../common/helpers/soft-delete.helper';
import { QueryHelper } from 'src/common/helpers/query.helper';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

@Injectable()
export class PushSubscriptionService implements ISoftDeletable {
  constructor(
    @InjectRepository(PushSubscription)
    private readonly repo: Repository<PushSubscription>,
  ) { }

  async create(createDto: CreatePushSubscriptionDto, userId?: number) {
    const entity = await this.repo.create(createDto);
    if (userId) entity.user_id = userId;
    return this.repo.save(entity);
  }

  async findAll(query: BaseQueryDto) {
    return await QueryHelper.paginate(this.repo, query, { sortField: 'id' });
  }

  async findOne(id: number) {

    return this.repo.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await SoftDeleteHelper.remove(this.repo, id, 'id', 'Push Subscription not found');
  }

  async restore(id: number): Promise<void> {
    await SoftDeleteHelper.restore(this.repo, id, 'id', 'Push Subscription not found');
  }

  private createBaseQuery(): SelectQueryBuilder<PushSubscription> {
    return this.repo.createQueryBuilder('push_subscription')
      .leftJoinAndSelect('push_subscription.user', 'user');
  }

  private applyStandardFilters(qb: SelectQueryBuilder<PushSubscription>, query: PushSubscriptionQueryDto) {
    const filterMap = {
      user_id: 'push_subscription.user_id = :user_id',
    };

    Object.entries(filterMap).forEach(([key, condition]) => {
      if (query[key] !== undefined) {
        qb.andWhere(condition, { [key]: query[key] });
      }
    });
  }

  private applySearch(qb: SelectQueryBuilder<PushSubscription>, search?: string) {
    if (search) {
      qb.andWhere('push_subscription.endpoint ILIKE :search', { search: `%${search}%` });
    }
  }

  private applyDateFilters(qb: SelectQueryBuilder<PushSubscription>, query: PushSubscriptionQueryDto) {
    const dateFilters = {
      created_before: { cond: 'push_subscription.created_at < :created_before', val: query.created_before },
      created_after: { cond: 'push_subscription.created_at > :created_after', val: query.created_after },
      updated_before: { cond: 'push_subscription.updated_at < :updated_before', val: query.updated_before },
      updated_after: { cond: 'push_subscription.updated_at > :updated_after', val: query.updated_after },
    };

    Object.entries(dateFilters).forEach(([key, { cond, val }]) => {
      if (val) qb.andWhere(cond, { [key]: val });
    });
  }

  private applySorting(qb: SelectQueryBuilder<PushSubscription>, sortBy?: string, sortOrder: string = 'desc') {
    if (sortBy) {
      qb.orderBy(`push_subscription.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('push_subscription.updated_at', 'DESC');
    }
  }

  private async paginateAndRespond(qb: SelectQueryBuilder<PushSubscription>, query: PushSubscriptionQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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
