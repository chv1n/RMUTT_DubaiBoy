import { UserRole } from "@/types/user";

export const getRolePath = (role?: UserRole | string | null): string => {
    if (!role) return '/super-admin'; // Default fallback

    const normalizedRole = role.toUpperCase();

    switch (normalizedRole) {
        case 'SUPER_ADMIN':
            return '/super-admin';
        case 'ADMIN':
            return '/admin';
        case 'USER':
            return '/user';
        case 'INVENTORY_MANAGER':
            return '/inventory-manager';
        case 'PRODUCTION_MANAGER':
            return '/prouction-manager'; // Matching directory typo
        case 'PURCHASE_MANAGER':
            return '/purchase-maneger'; // Matching directory typo
        default:
            return '/super-admin';
    }
};
