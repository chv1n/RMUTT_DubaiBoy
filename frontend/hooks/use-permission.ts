import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types/user';

export const usePermission = () => {
    const [userRole, setUserRole] = useState<UserRole | null>(() => {
        // Initialize state directly from localStorage if available to avoid flash of empty sidebar
        const user = authService.getUser();
        if (user && user.role) {
            return user.role as UserRole;
        }
        return null;
    });

    useEffect(() => {
        // Double check in effect in case of async updates or hydration mismatches (though localStorage is client-side)
        const user = authService.getUser();
        if (user && user.role) {
            setUserRole(user.role as UserRole);
        }
    }, []);

    const hasRole = (allowedRoles: UserRole[]) => {
        if (!userRole) return false;

        // SUPER_ADMIN has access to everything
        if (userRole === 'SUPER_ADMIN') return true;

        return allowedRoles.includes(userRole);
    };

    return {
        userRole,
        hasRole
    };
};
