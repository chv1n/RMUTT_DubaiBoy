import { Chip } from "@heroui/chip";
import { UserRole } from "@/types/user";

export const UserStatusBadge = ({ isActive }: { isActive: boolean }) => {
    return isActive ? (
        <Chip color="success" variant="flat" size="sm">Active</Chip>
    ) : (
        <Chip color="danger" variant="flat" size="sm">Inactive</Chip>
    );
};

export const UserRoleBadge = ({ role }: { role: UserRole }) => {
    switch (role) {
        case 'ADMIN':
            return <Chip color="primary" variant="dot" size="sm">Admin</Chip>;
        case 'SUPER_ADMIN':
            return <Chip color="secondary" variant="dot" size="sm">Super Admin</Chip>;
        case 'PRODUCTION_MANAGER':
            return <Chip color="warning" variant="dot" size="sm">Production Manager</Chip>;
        case 'INVENTORY_MANAGER':
            return <Chip color="success" variant="dot" size="sm">Inventory Manager</Chip>;
        case 'PURCHASE_MANAGER':
            return <Chip color="danger" variant="dot" size="sm">Purchase Manager</Chip>;
        case 'USER':
        default:
            return <Chip color="default" variant="flat" size="sm">User</Chip>;
    }
};
