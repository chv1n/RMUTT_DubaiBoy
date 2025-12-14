import { Meta } from "./api"; // Assuming types/api is accessible as "./api" or "@/types/api"

export type LocaleString = {
    en: string;
    th: string;
    ja: string;
};

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'PRODUCTION_MANAGER' | 'INVENTORY_MANAGER' | 'PURCHASE_MANAGER';

export interface User {
    id: number | string;
    email: string;
    username: string;
    fullname: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    deleted_at: string | null;

    last_login?: string | null;
    avatar_url?: string;
    phone?: string;
    department?: string;
}

export interface CreateUserPayload {
    email: string;
    username: string;
    fullname: string;
    password: string;
    role?: UserRole;
    department?: string;
    phone?: string;
    is_active?: boolean;
    notes?: string;
}

export interface UpdateUserPayload {
    email?: string;
    username?: string;
    fullname?: string;
    password?: string;
    role?: UserRole;
    department?: string;
    phone?: string;
    is_active?: boolean;
    notes?: string;
}

export interface UserFilter {
    page?: number;
    limit?: number;
    is_active?: boolean; // undefined = all, true = active, false = inactive
    search?: string;
    sort_field?: string;
    sort_order?: 'ASC' | 'DESC';
}

// UserListResponse is replaced by ApiResponse<User[]> in service

// Keep existing auxiliary types if likely to be used, or remove if strict cleanup needed.
// Keeping them for now to avoid breaking other imports immediately, but they are not in the spec.
export interface UserActivity {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    ip_address?: string;
}

export interface UserSession {
    id: string;
    device: string;
    browser: string;
    ip_address: string;
    last_active: string;
    is_current: boolean;
}
