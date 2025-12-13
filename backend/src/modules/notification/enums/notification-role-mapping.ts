import { Role } from 'src/common/enums/role.enum';
import { NotificationType } from './notification-type.enum';

/**
 * Mapping of notification types to target roles
 */
export const NotificationRoleMapping: Record<NotificationType, Role[]> = {
    // Stock & Inventory - INVENTORY_MANAGER, PURCHASE_MANAGER, ADMIN
    [NotificationType.LOW_STOCK]: [Role.INVENTORY_MANAGER, Role.PURCHASE_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    [NotificationType.LOW_STOCK_REMINDER]: [Role.PURCHASE_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    [NotificationType.MATERIAL_EXPIRING]: [Role.INVENTORY_MANAGER, Role.PURCHASE_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    [NotificationType.MATERIAL_EXPIRED]: [Role.INVENTORY_MANAGER, Role.PURCHASE_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    [NotificationType.MATERIAL_SHORTAGE]: [Role.INVENTORY_MANAGER, Role.PURCHASE_MANAGER, Role.PRODUCTION_MANAGER, Role.SUPER_ADMIN],
    [NotificationType.INVENTORY_RECEIVED]: [Role.INVENTORY_MANAGER, Role.PURCHASE_MANAGER, Role.SUPER_ADMIN],

    // Production - PRODUCTION_MANAGER
    [NotificationType.PRODUCTION_COMPLETED]: [Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    [NotificationType.PLAN_STATUS_CHANGED]: [Role.PRODUCTION_MANAGER, Role.SUPER_ADMIN],
    [NotificationType.PLAN_DEADLINE_APPROACHING]: [Role.PRODUCTION_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    [NotificationType.NEW_PLAN_ASSIGNED]: [Role.PRODUCTION_MANAGER, Role.SUPER_ADMIN],

    // Purchasing - PURCHASE_MANAGER
    [NotificationType.SUPPLIER_ORDER_REQUIRED]: [Role.PURCHASE_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
};
