import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardUserProvider {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    async getUserStats() {
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({
            where: { is_active: true },
        });
        const inactiveUsers = totalUsers - activeUsers;
        const userTrend = 'up'; // Mock
        const userChange = 5.2; // Mock

        return {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            change: userChange,
            trend: userTrend,
        };
    }
}
