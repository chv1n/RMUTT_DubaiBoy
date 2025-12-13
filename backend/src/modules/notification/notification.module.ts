import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationController } from './notification.controller';
import { PushSubscription } from '../push-subscription/entities/push-subscription.entity';
import { PushLog } from '../push-log/entities/push-log.entity';
import { User } from '../user/entities/user.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';
import { MaterialMaster } from '../material/entities/material-master.entity';
import { ProductPlan } from '../product-plan/entities/product-plan.entity';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([
            PushSubscription,
            PushLog,
            User,
            MaterialInventory,
            MaterialMaster,
            ProductPlan,
        ]),
    ],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationSchedulerService],
    exports: [NotificationService],
})
export class NotificationModule { }
