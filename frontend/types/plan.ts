export type PlanPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PlanStatus = 'DRAFT' | 'PENDING' | 'PRODUCTION' | 'COMPLETED' | 'CANCELLED';

// Backend DTOs
export interface ProductPlanDTO {
    id: number;
    product_id: number;
    input_quantity: number;
    plan_name: string;
    plan_description: string;
    start_date: string; // ISO Date
    end_date: string; // ISO Date
    plan_status: PlanStatus; // Add this if missing in previous turns
    plan_priority: PlanPriority;
    actual_produced_quantity?: number;
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
    id: string; // plan_list_id
    planListId: number;
    productPlanId: number;

    // Product Plan Details
    planCode: string;
    name: string;
    description: string;

    productId: number;
    productName: string;

    quantity: number;
    startDate: string;
    endDate: string;
    actualProducedQuantity?: number;

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


export interface MaterialRequirement {
    material_id: number;
    material_name: string;
    usage_per_piece: number;
    required_quantity: number;
    total_cost: number;

    // Detailed fields
    scrap_factor?: number;
    net_quantity?: number;
    scrap_quantity?: number;
    unit_cost?: number;

    available_stock?: number;
    stock_by_warehouse?: {
        warehouse_id: number;
        warehouse_name: string;
        available_quantity: number;
    }[];
}

export interface PlanPreview {
    plan_id: number;
    plan_name: string;
    input_quantity: number;
    estimated_cost: number;
    materials: MaterialRequirement[];
}

export interface PlanDashboardStats {
    total_plans: number;
    active_plans: number;
    completed_plans: number;
    pending_plans: number;
    delayed_plans?: number; // Kept as optional for backward compatibility if needed, but not in new JSON
    total_production_target: number;
    on_time_rate: number;
    trend?: {
        active_plans?: string;
        on_time_rate?: string;
    };
}

export interface PlanProgressItem {
    plan_id: number;
    plan_name: string;
    progress: number;
    status: string;
    due_date: string;
}

export interface PlanStatusDistributionItem {
    name: string;
    value: number;
    color: string;
}

