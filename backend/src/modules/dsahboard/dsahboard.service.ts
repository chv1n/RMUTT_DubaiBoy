import { Injectable } from '@nestjs/common';
import { DashboardQuery } from 'src/common/dto/dashboard-query';
import { DashboardUserProvider } from './providers/dashboard-user.provider';
import { DashboardMaterialProvider } from './providers/dashboard-material.provider';
import { DashboardPlanProvider } from './providers/dashboard-plan.provider';
import { DashboardInventoryProvider } from './providers/dashboard-inventory.provider';
import { DashboardSystemProvider } from './providers/dashboard-system.provider';
import { DashboardAlertProvider } from './providers/dashboard-alert.provider';

@Injectable()
export class DsahboardService {
  constructor(
    private userProvider: DashboardUserProvider,
    private materialProvider: DashboardMaterialProvider,
    private planProvider: DashboardPlanProvider,
    private inventoryProvider: DashboardInventoryProvider,
    private systemProvider: DashboardSystemProvider,
    private alertProvider: DashboardAlertProvider,
  ) { }

  async getOverviewStats(query: DashboardQuery) {
    const range = query?.range || 'month';

    const users = await this.userProvider.getUserStats();
    const materials = await this.materialProvider.getMaterialStats();
    const plans = await this.planProvider.getPlanStats();
    const inventory = await this.inventoryProvider.getInventoryStats();
    const systemPerformance = await this.systemProvider.getSystemPerformance();

    // Alerts depend on material low stock data
    const alerts = await this.alertProvider.getAlerts(materials.lowStock);

    return {
      success: true,
      message: 'สำเร็จ',
      data: {
        users,
        materials,
        plans,
        inventory,
        alerts,
        systemPerformance,
      },
    };
  }
}
