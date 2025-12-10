import { apiClient } from '@/lib/api/core/client';
import { User, CreateUserPayload, UpdateUserPayload } from "@/types/user";
import { ApiResponse } from '@/types/api';
import seedUsers from "@/mocks/seed/users.json";
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

// User Service
class UserService {
    private readonly endpoint = '/users';

    async getAll(
        page: number = 1,
        limit: number = 10,
        search: string = "",
        is_active?: boolean | null,
        sort_field: string = "created_at",
        sort_order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<ApiResponse<User[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            let filtered = [...(seedUsers as unknown as User[])];

            // Exclude soft-deleted by default unless maybe specific requirement? 
            // Spec says "Get All Users", usually implies active list. 
            // Let's filter out deleted_at != null
            filtered = filtered.filter(u => !u.deleted_at);

            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(u =>
                    u.username.toLowerCase().includes(s) ||
                    u.email.toLowerCase().includes(s) ||
                    u.fullname.toLowerCase().includes(s)
                );
            }

            if (is_active !== undefined && is_active !== null) {
                filtered = filtered.filter(u => u.is_active === is_active);
            }

            // Sorting
            filtered.sort((a, b) => {
                const valA = (a as any)[sort_field] ?? '';
                const valB = (b as any)[sort_field] ?? '';
                if (valA < valB) return sort_order === 'DESC' ? 1 : -1;
                if (valA > valB) return sort_order === 'DESC' ? -1 : 1;
                return 0;
            });

            const start = (page - 1) * limit;
            const paginatedData = filtered.slice(start, start + limit);

            return {
                success: true,
                data: paginatedData,
                meta: {
                    totalItems: filtered.length,
                    itemCount: paginatedData.length,
                    itemsPerPage: limit,
                    totalPages: Math.ceil(filtered.length / limit),
                    currentPage: page
                }
            };
        }

        // Real API
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (is_active !== undefined && is_active !== null) params.append('is_active', is_active.toString());
        // params.append('sort_field', sort_field);
        // params.append('sort_order', sort_order);

        const response = await apiClient.get<ApiResponse<User[]>>(`${this.endpoint}?${params.toString()}`);
        return response;
    }

    async getById(id: number | string): Promise<User> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const user = (seedUsers as unknown as User[]).find(u => u.id == id);
            if (!user) throw new Error("User not found");
            return user;
        }
        const response = await apiClient.get<ApiResponse<User>>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async create(data: CreateUserPayload): Promise<User> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            // Mock creation
            // Ideally we need to persist this in memory if strictly needed for session
            // But for simple "Mock Data" display, returning a fake object is okay.
            return {
                id: Math.floor(Math.random() * 10000),
                ...data,
                role: data.role || 'USER',
                is_active: data.is_active ?? true,
                created_at: new Date().toISOString(),
                deleted_at: null
            };
        }
        const response = await apiClient.post<ApiResponse<User>>(this.endpoint, data);
        return response.data;
    }

    async update(id: number | string, data: UpdateUserPayload): Promise<User> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const originalUser = (seedUsers as unknown as User[]).find(u => u.id == id) || {} as User;
            return {
                ...originalUser,
                ...data,
                // Ensure required fields for User type are present if originalUser is empty (though it shouldn't be found)
            } as User;
        }
        const response = await apiClient.put<ApiResponse<User>>(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    async delete(id: number | string): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.delete<void>(`${this.endpoint}/${id}`);
    }

    async restore(id: number | string): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return;
        }
        await apiClient.put<void>(`${this.endpoint}/${id}/restore`, {});
    }

    async export(filter: any): Promise<void> {
        if (MOCK_CONFIG.useMock) {
            console.log("Mock Export", filter);
            return;
        }
        // Use browser download logic if API returns blob, or window.open
        window.open(`${this.endpoint}/export?${new URLSearchParams(filter).toString()}`, '_blank');
    }

    async getUserActivity(id: number | string): Promise<any[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                { id: "1", action: "LOGIN", details: "User logged in", timestamp: new Date(Date.now() - 100000).toISOString(), ip_address: "192.168.1.1" },
                { id: "2", action: "UPDATE_PROFILE", details: "Updated email address", timestamp: new Date(Date.now() - 5000000).toISOString(), ip_address: "192.168.1.1" },
                { id: "3", action: "PASSWORD_CHANGE", details: "Changed password", timestamp: new Date(Date.now() - 10000000).toISOString(), ip_address: "192.168.1.1" },
                { id: "4", action: "LOGOUT", details: "User logged out", timestamp: new Date(Date.now() - 12000000).toISOString(), ip_address: "192.168.1.1" },
            ];
        }
        const response = await apiClient.get<ApiResponse<any[]>>(`${this.endpoint}/${id}/activity`);
        return response.data;
    }

    async getUserSessions(id: number | string): Promise<any[]> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return [
                { id: "1", device: "Desktop (Windows)", browser: "Chrome", ip_address: "192.168.1.1", last_active: new Date().toISOString(), is_current: true },
                { id: "2", device: "Mobile (iOS)", browser: "Safari", ip_address: "10.0.0.1", last_active: new Date(Date.now() - 86400000).toISOString(), is_current: false },
            ];
        }
        const response = await apiClient.get<ApiResponse<any[]>>(`${this.endpoint}/${id}`);
        return response.data;
    }
    async getStats(): Promise<any> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            return {
                totalUsers: 1254,
                activeUsers: 980,
                inactiveUsers: 240,
                newUsersThisMonth: 120,
                roleDistribution: [
                    { name: 'User', value: 1000, color: '#0088FE' },
                    { name: 'Admin', value: 150, color: '#00C49F' },
                    { name: 'Super Admin', value: 104, color: '#FFBB28' },
                ],
                userGrowth: [
                    { month: 'Jan', count: 400 },
                    { month: 'Feb', count: 600 },
                    { month: 'Mar', count: 800 },
                    { month: 'Apr', count: 850 },
                    { month: 'May', count: 1100 },
                    { month: 'Jun', count: 1254 },
                ],
                recentActivity: [
                    { id: 1, user: "Alice", action: "Login", time: "2 mins ago" },
                    { id: 2, user: "Bob", action: "Purchase", time: "1 hour ago" },
                    { id: 3, user: "Charlie", action: "Update Profile", time: "3 hours ago" },
                    { id: 4, user: "David", action: "Logout", time: "5 hours ago" },
                ]
            };
        }

        try {
            const response = await apiClient.get<ApiResponse<any>>(`${this.endpoint}/dashboard/stats`);
            return response.data;
        } catch (error) {
            console.warn("API user stats failed", error);
            return {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                newUsersThisMonth: 0,
                roleDistribution: [],
                userGrowth: [],
                recentActivity: []
            };
        }
    }
}

export const userService = new UserService();
