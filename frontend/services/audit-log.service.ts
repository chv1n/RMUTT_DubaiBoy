
import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types/api';
import { MOCK_CONFIG, simulateDelay } from '@/lib/mock/config';

// Types based on API Spec
export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    RESTORE = 'RESTORE',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILED = 'LOGIN_FAILED',
    LOGOUT = 'LOGOUT',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE'
}

export enum AuditEntity {
    MaterialMaster = 'MaterialMaster',
    Supplier = 'Supplier',
    WarehouseMaster = 'WarehouseMaster',
    User = 'User',
    Bom = 'Bom',
    ProductPlan = 'ProductPlan',
    PlanList = 'PlanList',
    Auth = 'Auth'
}

export interface AuditLog {
    id: number;
    user_id: number;
    username: string;
    action: AuditAction;
    entity_type: AuditEntity;
    entity_id: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    created_at: string;
}

export interface AuditLogQuery {
    page?: number;
    limit?: number;
    sort_order?: 'ASC' | 'DESC';
    sort_by?: string;
    action?: AuditAction | 'all';
    entity_type?: AuditEntity;
    entity_id?: string;
    user_id?: number;
    start_date?: string;
    end_date?: string;
}

// Mock Data
const mockAuditLogs: AuditLog[] = [
    {
        id: 1,
        user_id: 1,
        username: "admin@example.com",
        action: AuditAction.UPDATE,
        entity_type: AuditEntity.MaterialMaster,
        entity_id: "5",
        old_values: {
            "material_name": "Steel Bar A",
            "container_min_stock": 50
        },
        new_values: {
            "material_name": "Steel Bar Grade A",
            "container_min_stock": 100
        },
        created_at: "2024-12-09T10:30:00.000Z"
    },
    {
        id: 2,
        user_id: 1,
        username: "admin@example.com",
        action: AuditAction.CREATE,
        entity_type: AuditEntity.MaterialMaster,
        entity_id: "6",
        old_values: null,
        new_values: {
            "material_name": "Copper Wire",
            "is_active": true
        },
        created_at: "2024-12-09T11:00:00.000Z"
    },
    {
        id: 3,
        user_id: 2,
        username: "manager@example.com",
        action: AuditAction.LOGIN_SUCCESS,
        entity_type: AuditEntity.Auth,
        entity_id: "2",
        old_values: null,
        new_values: {
            "ip": "192.168.1.50",
            "agent": "Chrome/90.0"
        },
        created_at: "2024-12-10T08:15:00.000Z"
    },
    {
        id: 4,
        user_id: 1,
        username: "admin@example.com",
        action: AuditAction.DELETE,
        entity_type: AuditEntity.Supplier,
        entity_id: "10",
        old_values: {
            "id": 10,
            "name": "Old Supplier Ltd."
        },
        new_values: null,
        created_at: "2024-12-10T09:20:00.000Z"
    },
    {
        id: 5,
        user_id: 3,
        username: "staff@example.com",
        action: AuditAction.UPDATE,
        entity_type: AuditEntity.WarehouseMaster,
        entity_id: "WH-001",
        old_values: {
            "capacity": 5000
        },
        new_values: {
            "capacity": 6000
        },
        created_at: "2024-12-10T10:00:00.000Z"
    }
];

class AuditLogService {
    private readonly endpoint = '/audit-logs';

    async getAll(query: AuditLogQuery = {}): Promise<ApiResponse<AuditLog[]>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            let filtered = [...mockAuditLogs];

            // Filtering
            if (query.action && query.action !== 'all') {
                filtered = filtered.filter(log => log.action === query.action);
            }
            if (query.entity_type) {
                filtered = filtered.filter(log => log.entity_type === query.entity_type);
            }
            if (query.entity_id) {
                filtered = filtered.filter(log => log.entity_id === query.entity_id);
            }
            if (query.user_id) {
                filtered = filtered.filter(log => log.user_id === query.user_id);
            }
            if (query.start_date) {
                filtered = filtered.filter(log => new Date(log.created_at) >= new Date(query.start_date!));
            }
            if (query.end_date) {
                const endDate = new Date(query.end_date!);
                endDate.setHours(23, 59, 59, 999);
                filtered = filtered.filter(log => new Date(log.created_at) <= endDate);
            }

            // Sorting
            const sortField = query.sort_by || 'created_at';
            const sortOrder = query.sort_order || 'DESC';

            filtered.sort((a, b) => {
                const valA = (a as any)[sortField];
                const valB = (b as any)[sortField];
                if (valA < valB) return sortOrder === 'DESC' ? 1 : -1;
                if (valA > valB) return sortOrder === 'DESC' ? -1 : 1;
                return 0;
            });

            // Pagination
            const page = query.page || 1;
            const limit = query.limit || 20;
            const start = (page - 1) * limit;
            const paginatedData = filtered.slice(start, start + limit);

            return {
                success: true,
                message: "สำเร็จ",
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

        const params = new URLSearchParams();
        if (query.page) params.append('page', query.page.toString());
        if (query.limit) params.append('limit', query.limit.toString());
        if (query.sort_order) params.append('sort_order', query.sort_order);
        if (query.sort_by) params.append('sort_by', query.sort_by);
        if (query.action === "all" || !query.action) {
            params.delete('action');
        } else {
            params.append('action', query.action);
        }
        if (query.entity_type) params.append('entity_type', query.entity_type);
        if (query.entity_id) params.append('entity_id', query.entity_id);
        if (query.user_id) params.append('user_id', query.user_id.toString());
        if (query.start_date) params.append('start_date', query.start_date);
        if (query.end_date) params.append('end_date', query.end_date);

        const response = await apiClient.get<ApiResponse<AuditLog[]>>(`${this.endpoint}?${params.toString()}`);
        return response;
    }

    async getById(id: number): Promise<ApiResponse<AuditLog>> {
        if (MOCK_CONFIG.useMock) {
            await simulateDelay();
            const log = mockAuditLogs.find(l => l.id === id);
            if (!log) {
                throw new Error("Audit Log not found");
            }
            return {
                success: true,
                message: "สำเร็จ",
                data: log
            };
        }

        const response = await apiClient.get<ApiResponse<AuditLog>>(`${this.endpoint}/${id}`);
        return response;
    }
}

export const auditLogService = new AuditLogService();
