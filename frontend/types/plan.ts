export type PlanPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PlanStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Backend DTOs
export interface ProductPlanDTO {
    id: number;
    product_id: number;
    input_quantity: number;
    plan_name: string;
    plan_description: string;
    start_date: string; // ISO Date
    end_date: string; // ISO Date
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    product?: {
        product_id: number;
        product_name: string;
        product_type_id: number | null;
        is_active: boolean;
    };
}

export interface PlanListDTO {
    id: number;
    plan_id: number;
    priority: PlanPriority;
    status: PlanStatus;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    plan?: ProductPlanDTO;
}

// Domain Model (Unified for UI)
export interface Plan {
    id: string; // plan_list_id (string for frontend consistency, convert to number for API)
    planListId: number;
    productPlanId: number;

    // Product Plan Details
    planCode: string; // Generated or ID-based
    name: string;
    description: string;

    productId: number;
    productName: string;

    quantity: number;
    startDate: string;
    endDate: string;

    // Plan List Details
    priority: PlanPriority;
    status: PlanStatus;

    lastUpdated: string;
}

export interface CreatePlanRequest {
    // Product Plan Data
    product_id: number;
    plan_name: string;
    plan_description?: string;
    input_quantity: number;
    start_date: string;
    end_date: string;

    // Plan List Data
    priority: PlanPriority;
    status: PlanStatus;
}

export interface UpdatePlanRequest {
    plan_name?: string;
    plan_description?: string;
    input_quantity?: number;
    start_date?: string;
    end_date?: string;

    priority?: PlanPriority;
    status?: PlanStatus;
}

export interface PlanFilter {
    page?: number;
    limit?: number;
    sort_field?: string;
    sort_order?: 'ASC' | 'DESC';
    search?: string;
    status?: PlanStatus | 'all';
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface PlanStats {
    totalPlans: number;
    activePlans: number;
    completedPlans: number;
    pendingPlans: number;
    totalProductionTarget: number;
    onTimeRate: number;
    progress: { plan_name: string; target: number; produced: number; status: string }[];
    statusDistribution: { name: string; value: number; color?: string }[];
}

