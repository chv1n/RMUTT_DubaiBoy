import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { NotificationService } from './notification.service';
import { NotificationType } from './enums';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { ProductPlan } from '../product-plan/entities/product-plan.entity';
import { PlanStatusEnum } from '../product-plan/enum/plan-status.enum';

@Injectable()
export class NotificationSchedulerService {
    private readonly logger = new Logger(NotificationSchedulerService.name);

    constructor(
        private readonly notificationService: NotificationService,
        @InjectRepository(MaterialInventory)
        private readonly inventoryRepo: Repository<MaterialInventory>,
        @InjectRepository(MaterialMaster)
        private readonly materialRepo: Repository<MaterialMaster>,
        @InjectRepository(ProductPlan)
        private readonly planRepo: Repository<ProductPlan>,
    ) { }

    /**
     * Check for low stock materials - Every hour
     */
    @Cron(CronExpression.EVERY_HOUR)
    async checkLowStock(): Promise<void> {
        this.logger.log('Running low stock check...');

        try {
            // Get materials with min stock defined
            const materials = await this.materialRepo.find({
                where: { is_active: true },
                relations: ['materialInventory'],
            });

            for (const material of materials) {
                if (!material.container_min_stock) continue;

                // Calculate total quantity across all warehouses
                const totalQuantity = material.materialInventory?.reduce(
                    (sum, inv) => sum + (inv.quantity || 0),
                    0
                ) || 0;

                if (totalQuantity < material.container_min_stock) {
                    await this.notificationService.sendByType(
                        NotificationType.LOW_STOCK,
                        '⚠️ วัตถุดิบใกล้หมด',
                        `${material.material_name} เหลือเพียง ${totalQuantity} (ต่ำกว่า ${material.container_min_stock})`,
                        {
                            material_id: material.material_id,
                            material_name: material.material_name,
                            current_stock: totalQuantity,
                            min_stock: material.container_min_stock,
                        }
                    );
                    this.logger.log(`Low stock alert sent for material: ${material.material_name}`);
                }
            }
        } catch (error) {
            this.logger.error(`Low stock check failed: ${error.message}`);
        }
    }

    /**
     * Check for expiring materials - Every day at 8:00 AM
     */
    @Cron('0 8 * * *')
    async checkMaterialExpiry(): Promise<void> {
        this.logger.log('Running material expiry check...');

        try {
            const now = new Date();
            const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            // Check inventory items with expiry dates
            const expiringItems = await this.inventoryRepo.find({
                where: {
                    exp_date: Between(now, sevenDaysLater),
                },
                relations: ['material'],
            });

            for (const item of expiringItems) {
                const daysUntilExpiry = Math.ceil(
                    (item.exp_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                await this.notificationService.sendByType(
                    NotificationType.MATERIAL_EXPIRING,
                    '⏰ วัตถุดิบใกล้หมดอายุ',
                    `${item.material?.material_name || 'Unknown'} จะหมดอายุใน ${daysUntilExpiry} วัน`,
                    {
                        inventory_id: item.id,
                        material_name: item.material?.material_name,
                        exp_date: item.exp_date,
                        days_until_expiry: daysUntilExpiry,
                    }
                );
            }

            // Check for already expired items
            const expiredItems = await this.inventoryRepo.find({
                where: {
                    exp_date: LessThan(now),
                    quantity: MoreThan(0),
                },
                relations: ['material'],
            });

            for (const item of expiredItems) {
                await this.notificationService.sendByType(
                    NotificationType.MATERIAL_EXPIRED,
                    '❌ วัตถุดิบหมดอายุ',
                    `${item.material?.material_name || 'Unknown'} หมดอายุแล้ว!`,
                    {
                        inventory_id: item.id,
                        material_name: item.material?.material_name,
                        exp_date: item.exp_date,
                    }
                );
            }

            this.logger.log(`Expiry check complete. Expiring: ${expiringItems.length}, Expired: ${expiredItems.length}`);
        } catch (error) {
            this.logger.error(`Material expiry check failed: ${error.message}`);
        }
    }

    /**
     * Check for plan deadlines - Every day at 9:00 AM
     */
    @Cron('0 9 * * *')
    async checkPlanDeadlines(): Promise<void> {
        this.logger.log('Running plan deadline check...');

        try {
            const now = new Date();
            const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            // Find plans with approaching deadlines that are still in progress
            const plans = await this.planRepo.find({
                where: {
                    end_date: Between(now, threeDaysLater),
                    plan_status: PlanStatusEnum.PRODUCTION,
                },
                relations: ['product'],
            });

            for (const plan of plans) {
                const daysUntilDeadline = Math.ceil(
                    (plan.end_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                await this.notificationService.sendByType(
                    NotificationType.PLAN_DEADLINE_APPROACHING,
                    '📅 แผนผลิตใกล้ถึง Deadline',
                    `${plan.plan_name} ต้องเสร็จภายใน ${daysUntilDeadline} วัน`,
                    {
                        plan_id: plan.id,
                        plan_name: plan.plan_name,
                        end_date: plan.end_date,
                        days_until_deadline: daysUntilDeadline,
                    }
                );
            }

            this.logger.log(`Deadline check complete. Plans approaching deadline: ${plans.length}`);
        } catch (error) {
            this.logger.error(`Plan deadline check failed: ${error.message}`);
        }
    }

    /**
     * Send low stock reminders - Every day at 10:00 AM
     * For items that are still low after previous notification
     */
    @Cron('0 10 * * *')
    async sendLowStockReminders(): Promise<void> {
        this.logger.log('Running low stock reminder...');
        // Re-use low stock check but with REMINDER type
        try {
            const materials = await this.materialRepo.find({
                where: { is_active: true },
                relations: ['materialInventory'],
            });

            for (const material of materials) {
                if (!material.container_min_stock) continue;

                const totalQuantity = material.materialInventory?.reduce(
                    (sum, inv) => sum + (inv.quantity || 0),
                    0
                ) || 0;

                if (totalQuantity < material.container_min_stock) {
                    await this.notificationService.sendByType(
                        NotificationType.LOW_STOCK_REMINDER,
                        '🔔 เตือนอีกครั้ง: วัตถุดิบใกล้หมด',
                        `${material.material_name} ยังไม่ได้จัดซื้อ (เหลือ ${totalQuantity})`,
                        {
                            material_id: material.material_id,
                            material_name: material.material_name,
                            current_stock: totalQuantity,
                            min_stock: material.container_min_stock,
                        }
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Low stock reminder failed: ${error.message}`);
        }
    }

    /**
     * Manual trigger for testing - can be called from controller
     */
    async triggerManualCheck(checkType: 'low_stock' | 'expiry' | 'deadlines' | 'reminder'): Promise<string> {
        switch (checkType) {
            case 'low_stock':
                await this.checkLowStock();
                return 'Low stock check completed';
            case 'expiry':
                await this.checkMaterialExpiry();
                return 'Material expiry check completed';
            case 'deadlines':
                await this.checkPlanDeadlines();
                return 'Plan deadline check completed';
            case 'reminder':
                await this.sendLowStockReminders();
                return 'Low stock reminder completed';
            default:
                return 'Unknown check type';
        }
    }
}
