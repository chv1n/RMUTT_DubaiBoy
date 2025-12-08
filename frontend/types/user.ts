export type LocaleString = {
    en: string;
    th: string;
    ja: string;
};

export type UserRole = 'admin' | 'approver' | 'editor' | 'viewer' | string;

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
    id: string;
    username: string;
    email: string;
    display_name: LocaleString;
    roles: UserRole[];
    department: string;
    status: UserStatus;
    last_login: string | null; // ISO Date string
    created_at: string; // ISO Date string
    phone?: string;
    locale?: string;
    timezone?: string;
    external_id?: string;
    avatar_url?: string;
    notes?: string;
}

export interface CreateUserPayload {
    username: string;
    email: string;
    display_name: LocaleString;
    roles: UserRole[];
    department: string;
    phone?: string;
    locale?: string;
    timezone?: string;
    notes?: string;
    status?: UserStatus;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
    status?: UserStatus;
}

export interface UserFilter {
    search?: string;
    role?: string;
    department?: string;
    status?: UserStatus | 'all';
    page?: number; // 1-based
    limit?: number;
    sort_by?: string;
    sort_desc?: boolean;
}

export interface UserListResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

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
