import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as webPush from 'web-push';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:example@yourdomain.org');

    if (publicKey && privateKey) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      Logger.warn('VAPID keys not found. Push notifications will not work.', 'PushSubscriptionService');
    }
  }

  async create(createDto: CreatePushSubscriptionDto, userId?: number) {
    console.log(`[PushService] Creating/Updating subscription. UserID: ${userId}, Endpoint: ${createDto.endpoint.substring(0, 20)}...`);
    const existing = await this.repo.findOne({ where: { endpoint: createDto.endpoint } });
    if (existing) {
      if (userId) {
        console.log(`[PushService] Updating existing subscription with UserID: ${userId}`);
        existing.user_id = userId;
        return this.repo.save(existing);
      }
      console.log(`[PushService] Subscription exists, no UserID provided to update.`);
      return existing;
    }

    console.log(`[PushService] Creating NEW subscription. UserID: ${userId}`);
    const entity = this.repo.create({
      endpoint: createDto.endpoint,
      p256dh: createDto.keys.p256dh,
      auth: createDto.keys.auth,
      user_id: userId,
    });
    return this.repo.save(entity);
  }

  async deleteByEndpoint(endpoint: string) {
    const sub = await this.repo.findOne({ where: { endpoint } });
    if (sub) {
      await this.repo.softDelete(sub.id);
    }
  }

  async sendToRoles(roles: string[], payload: any) {
    // Debug: Check total subs
    const totalSubs = await this.repo.count();
    console.log(`[PushService] Total subscriptions in DB (orphaned + linked): ${totalSubs}`);

    // 1. Get user IDs first (Simpler query with case-insensitive check)
    // We expect roles to be checked against lowercase values
    const safeRoles = roles.map(r => `'${r.toLowerCase()}'`).join(',');
    const users = await this.repo.manager.query(
      `SELECT id FROM users WHERE LOWER(role) IN (${safeRoles})`
    );
    const userIds = users.map(u => u.id);
    console.log(`[PushService] Found ${userIds.length} users with roles [${roles.join(',')}]: IDs ${userIds.join(',')}`);

    if (userIds.length === 0) {
      console.log('[PushService] No users found with roles:', roles);
      return [];
    }

    // 2. Get subscriptions for these users
    const subscriptions = await this.repo.createQueryBuilder('sub')
      .where('sub.user_id IN (:...userIds)', { userIds })
      .getMany();

    console.log(`[PushService] Found ${subscriptions.length} subscriptions for roles: ${roles.join(', ')}`);

    return this.sendToSubscriptions(subscriptions, payload);
  }

  private async sendToSubscriptions(subscriptions: PushSubscription[], payload: any) {
    const notificationPayload = JSON.stringify(payload);

    const promises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh, // Assuming valid string
            auth: sub.auth // Assuming valid string
          }
        }, notificationPayload);
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.repo.softDelete(sub.id);
        }
        Logger.error('Error sending push notification', error);
      }
    });
    return Promise.all(promises);
  }

  async sendNotification(userId: number, payload: any) {
    const subscriptions = await this.repo.find({ where: { user_id: userId } });
    return this.sendToSubscriptions(subscriptions, payload);
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
