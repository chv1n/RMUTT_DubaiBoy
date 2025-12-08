import { User, CreateUserPayload, UpdateUserPayload, UserFilter, UserListResponse, UserActivity, UserSession } from "@/types/user";
import { apiClient } from "@/lib/api/core/client";
import seedUsers from "@/mocks/seed/users.json"; // Ensure TS config allows json import or use require

// Types for internal usage
type UserWithIndex = User & { [key: string]: any };

export interface IUserService {
    listUsers(filter: UserFilter): Promise<UserListResponse>;
    getUser(id: string): Promise<User | null>;
    createUser(payload: CreateUserPayload): Promise<User>;
    updateUser(id: string, payload: UpdateUserPayload): Promise<User>;
    deleteUser(id: string): Promise<void>;
    bulkDelete(ids: string[]): Promise<void>;
    enableUser(id: string): Promise<void>;
    disableUser(id: string): Promise<void>;
    inviteUser(email: string): Promise<void>;
    resetPassword(id: string): Promise<void>;
    importUsers(file: File): Promise<void>;
    exportUsers(filter: UserFilter): Promise<void>;
    listRoles(): Promise<string[]>; // Simple list of role names for now // Simplified for now
    getUserActivity(id: string): Promise<UserActivity[]>;
    getUserSessions(id: string): Promise<UserSession[]>;
}

// Mock Implementation
class MockUserService implements IUserService {
    private users: User[] = [...(seedUsers as unknown as User[])];

    async listUsers(filter: UserFilter): Promise<UserListResponse> {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        
        let filtered = [...this.users];

        if (filter.search) {
            const s = filter.search.toLowerCase();
            filtered = filtered.filter(u => 
                u.username.toLowerCase().includes(s) || 
                u.email.toLowerCase().includes(s) || 
                u.display_name.en.toLowerCase().includes(s)
            );
        }
        
        if (filter.role) {
            filtered = filtered.filter(u => u.roles.includes(filter.role!));
        }

        if (filter.status && filter.status !== 'all') {
            filtered = filtered.filter(u => u.status === filter.status);
        }

        if (filter.department) {
            filtered = filtered.filter(u => u.department === filter.department);
        }

        // Sorting
        if (filter.sort_by) {
            filtered.sort((a, b) => {
                const valA = (a as UserWithIndex)[filter.sort_by!] || '';
                const valB = (b as UserWithIndex)[filter.sort_by!] || '';
                if (valA < valB) return filter.sort_desc ? 1 : -1;
                if (valA > valB) return filter.sort_desc ? -1 : 1;
                return 0;
            });
        }

        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            data: filtered.slice(start, end),
            meta: {
                total: filtered.length,
                page,
                limit,
                total_pages: Math.ceil(filtered.length / limit)
            }
        };
    }

    async getUser(id: string): Promise<User | null> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.users.find(u => u.id === id) || null;
    }

    async createUser(payload: CreateUserPayload): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 600));
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...payload,
            status: payload.status || 'active',
            last_login: null,
            created_at: new Date().toISOString()
        };
        this.users.push(newUser);
        return newUser;
    }

    async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 400));
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) throw new Error("User not found");
        
        this.users[index] = { ...this.users[index], ...payload };
        return this.users[index];
    }

    async deleteUser(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 400));
        this.users = this.users.filter(u => u.id !== id);
    }

    async bulkDelete(ids: string[]): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 600));
        this.users = this.users.filter(u => !ids.includes(u.id));
    }

    async enableUser(id: string): Promise<void> {
        await this.updateUser(id, { status: 'active' });
    }

    async disableUser(id: string): Promise<void> {
        await this.updateUser(id, { status: 'inactive' });
    }

    async inviteUser(email: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Mock: Invite sent to ${email}`);
    }

    async resetPassword(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Mock: Password reset for ${id}`);
    }

    async importUsers(file: File): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`Mock: Imported users from ${file.name}`);
    }

    async exportUsers(filter: UserFilter): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Mock: Exported users with filter`, filter);
    }

    async listRoles(): Promise<string[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return ["admin", "approver", "editor", "viewer"];
    }

    async getUserActivity(id: string): Promise<UserActivity[]> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [
            { id: "log-1", action: "login", details: "Logged in from Chrome on Windows", timestamp: new Date(Date.now() - 3600000).toISOString(), ip_address: "192.168.1.1" },
            { id: "log-2", action: "update_profile", details: "Updated display name", timestamp: new Date(Date.now() - 86400000).toISOString(), ip_address: "192.168.1.1" },
            { id: "log-3", action: "change_password", details: "Password changed successfully", timestamp: new Date(Date.now() - 172800000).toISOString(), ip_address: "192.168.1.1" }
        ];
    }

    async getUserSessions(id: string): Promise<UserSession[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
             { id: "sess-1", device: "Desktop (Windows)", browser: "Chrome 120.0", ip_address: "192.168.1.1", last_active: new Date().toISOString(), is_current: true },
             { id: "sess-2", device: "Mobile (iOS)", browser: "Safari Mobile", ip_address: "10.0.0.5", last_active: new Date(Date.now() - 86400000).toISOString(), is_current: false }
        ];
    }
}

// API Implementation
class ApiUserService implements IUserService {
    private baseUrl = '/users';

    async listUsers(filter: UserFilter): Promise<UserListResponse> {
        const params = new URLSearchParams();
        if (filter.page) params.append('page', filter.page.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());
        if (filter.search) params.append('search', filter.search);
        if (filter.role) params.append('role', filter.role);
        if (filter.status && filter.status !== 'all') params.append('status', filter.status);
        if (filter.department) params.append('department', filter.department);
        if (filter.sort_by) params.append('sort', filter.sort_by); // Simplified

        const response = await apiClient.get<UserListResponse>(`${this.baseUrl}?${params.toString()}`);
        return response as unknown as UserListResponse; // Type assertion depending on client return
    }

    async getUser(id: string): Promise<User | null> {
        const response = await apiClient.get<User>(`${this.baseUrl}/${id}`);
        return response as unknown as User;
    }

    async createUser(payload: CreateUserPayload): Promise<User> {
        const response = await apiClient.post<User>(this.baseUrl, payload);
        return response as unknown as User;
    }

    async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
        const response = await apiClient.put<User>(`${this.baseUrl}/${id}`, payload);
        return response as unknown as User;
    }

    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }

    async bulkDelete(ids: string[]): Promise<void> {
        await apiClient.post(`${this.baseUrl}/bulk-delete`, { ids });
    }

    async enableUser(id: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${id}/enable`, {});
    }

    async disableUser(id: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${id}/disable`, {});
    }

    async inviteUser(email: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/invite`, { email });
    }

    async resetPassword(id: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${id}/reset-password`, {});
    }

    async importUsers(file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);
        await apiClient.post(`${this.baseUrl}/import`, formData);
    }

    async exportUsers(filter: UserFilter): Promise<void> {
        // Implement blob download if needed
        window.open(`${this.baseUrl}/export?${new URLSearchParams(filter as any).toString()}`, '_blank');
    }

    async listRoles(): Promise<string[]> {
        const response = await apiClient.get<string[]>('/roles'); // Assuming API exists
        return response as unknown as string[];
    }
    
    async getUserActivity(id: string): Promise<UserActivity[]> {
        const response = await apiClient.get<UserActivity[]>(`${this.baseUrl}/${id}/activity`);
        return response as unknown as UserActivity[];
    }

    async getUserSessions(id: string): Promise<UserSession[]> {
        const response = await apiClient.get<UserSession[]>(`${this.baseUrl}/${id}/sessions`);
        return response as unknown as UserSession[];
    }
}

// Factory
const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true; // Default to true for development as requested

export const userService = useMock ? new MockUserService() : new ApiUserService();
