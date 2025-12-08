export type PlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | 'inactive';

export interface LocalizedString {
    en: string;
    th: string;
    ja: string;
}

export interface PlanUser {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
}

export interface PlanItem {
    id: string;
    material_code: string;
    material_name: string;
    qty: number;
    uom: string;
    remarks?: string;
}

export interface Plan {
    id: string;
    plan_code: string;
    name: LocalizedString;
    description?: LocalizedString;
    type: string;
    owner: PlanUser;
    start_date: string; // ISO Date "YYYY-MM-DD"
    end_date: string;   // ISO Date "YYYY-MM-DD"
    status: PlanStatus;
    items: PlanItem[];
    items_count: number;
    notes?: string;
    last_updated: string; // ISO DateTime
    history?: PlanHistory[];
    documents?: PlanDocument[];
}

export interface PlanHistory {
    id: string;
    action: string;
    user: PlanUser;
    timestamp: string;
    comment?: string;
}

export interface PlanDocument {
    id: string;
    name: string;
    url: string; // Mocked signed URL or local path
    type: string;
    size: number;
    uploaded_at: string;
}

export interface PlanFilter {
    search?: string;
    status?: PlanStatus | 'all';
    type?: string;
    owner_id?: string;
    start_date_from?: string;
    start_date_to?: string;
    page?: number;
    limit?: number;
    sort_by?: keyof Plan;
    sort_desc?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
