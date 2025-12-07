import { Chip } from "@heroui/chip";
import { UserStatus, UserRole } from "@/types/user";

export const UserStatusBadge = ({ status }: { status: UserStatus }) => {
    switch (status) {
        case 'active':
            return <Chip color="success" variant="flat" size="sm">Active</Chip>;
        case 'inactive':
            return <Chip color="danger" variant="flat" size="sm">Inactive</Chip>;
        case 'pending':
            return <Chip color="warning" variant="flat" size="sm">Pending</Chip>;
        default:
            return <Chip color="default" variant="flat" size="sm">{status}</Chip>;
    }
};

export const UserRoleBadge = ({ role }: { role: UserRole }) => {
    switch (role) {
        case 'admin':
            return <Chip color="primary" variant="dot" size="sm">Admin</Chip>;
        case 'approver':
            return <Chip color="secondary" variant="dot" size="sm">Approver</Chip>;
        case 'editor':
            return <Chip color="warning" variant="dot" size="sm">Editor</Chip>;
        case 'viewer':
            return <Chip color="default" variant="dot" size="sm">Viewer</Chip>;
        default:
            return <Chip color="default" variant="flat" size="sm">{role}</Chip>;
    }
};
