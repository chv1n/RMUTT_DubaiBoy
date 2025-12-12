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
        case 'USER':
        default:
            return <Chip color="default" variant="flat" size="sm">User</Chip>;
    }
};
