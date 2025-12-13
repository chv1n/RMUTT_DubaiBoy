import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuditLog } from '../../audit-log/entities/audit-log.entity';

@Injectable()
export class DashboardUserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) { }

    async getStats(period: string = '6months') {
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({ where: { is_active: true } });
        const inactiveUsers = await this.userRepository.count({ where: { is_active: false } });

        // New Users This Month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsersThisMonth = await this.userRepository
            .createQueryBuilder('user')
            .where('user.created_at >= :startOfMonth', { startOfMonth })
            .getCount();

        // Role Distribution
        const roles = await this.userRepository
            .createQueryBuilder('user')
            .select('user.role', 'name')
            .addSelect('COUNT(user.id)', 'value')
            .groupBy('user.role')
            .getRawMany();

        const roleDistribution = roles.map(r => ({
            name: r.name ? r.name.toUpperCase() : 'UNKNOWN',
            value: Number(r.value),
            color: this.getRoleColor(r.name)
        }));

        // User Growth
        const userGrowth = await this.getUserGrowth(period);

        // Recent Activity
        const recentActivity = await this.getRecentActivity(5);

        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            newUsersThisMonth,
            roleDistribution,
            userGrowth,
            recentActivity
        };
    }

    async getActivityLogs(page: number = 1, limit: number = 10) {
        const [items, total] = await this.auditLogRepository.findAndCount({
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Map standard response to desired format if needed, but requirements show specific structure "data"
        // Requirement structure: id, userId, username, action, target, timestamp
        // AuditLog entity: id, user_id, username, action, entity_type, entity_id, created_at

        const data = items.map(log => ({
            id: log.id,
            userId: log.user_id,
            username: log.username,
            action: log.action,
            target: `${log.entity_type} ${log.entity_id || ''}`.trim(),
            timestamp: log.created_at
        }));

        return {
            data,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        };
    }

    private async getUserGrowth(period: string) {
        const months = period === 'year' ? 12 : 6;
        const now = new Date();
        const data: any[] = [];

        // Return cumulative count or new users per month?
        // Requirement "User Growth: [{month: Jan, count: 120}]" usually implies cumulative or new.
        // Given "Growth", cumulative is often expected, or simple trend.
        // Let's assume cumulative count at end of each month.

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59); // End of month

            const count = await this.userRepository
                .createQueryBuilder('user')
                .where('user.created_at <= :endOfMonth', { endOfMonth: nextMonth })
                .getCount();

            data.push({
                month: date.toLocaleString('en-US', { month: 'short' }),
                count
            });
        }
        return data;
    }

    private async getRecentActivity(limit: number) {
        // Requirement: { id, user, action, timestamp, details }
        // AuditLog: id, username, action, created_at, new_values/old_values

        const logs = await this.auditLogRepository.find({
            order: { created_at: 'DESC' },
            take: limit
        });

        return logs.map(log => ({
            id: log.id,
            user: log.username || 'Unknown',
            action: log.action,
            timestamp: log.created_at,
            details: `Action on ${log.entity_type}` // Simplified details
        }));
    }

    private getRoleColor(role: string): string {
        switch (role?.toLowerCase()) {
            case 'super_admin': return '#FFBB28';
            case 'admin': return '#00C49F';
            case 'user': return '#0088FE';
            default: return '#8884d8';
        }
    }
}
