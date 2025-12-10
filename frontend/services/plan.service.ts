

import {
    Plan,
    PlanFilter,
    PaginatedResponse,
    PlanStatus,
    PlanListDTO,
    ProductPlanDTO,
    CreatePlanRequest,
    UpdatePlanRequest
} from "@/types/plan";
import { apiClient } from "@/lib/api/core/client";

// Mappers
const mapCombinedToDomain = (listDto: PlanListDTO): Plan => {
    // If plan details are missing (shouldn't happen in standard flow), provide defaults
    const productPlan = listDto.plan || {
        id: 0,
        product_id: 0,
        input_quantity: 0,
        plan_name: "Unknown Plan",
        plan_description: "",
        start_date: "",
        end_date: "",
        created_at: "",
        updated_at: "",
        deleted_at: null
    };

    return {
        id: listDto.id.toString(), // Plan List ID
        planListId: listDto.id,
        productPlanId: listDto.plan_id,

        planCode: `PLN-${listDto.id.toString().padStart(4, '0')}`,
        name: productPlan.plan_name,
        description: productPlan.plan_description,

        productId: productPlan.product_id,
        productName: productPlan.product?.product_name || `Product-${productPlan.product_id}`,

        quantity: productPlan.input_quantity,
        startDate: productPlan.start_date,
        endDate: productPlan.end_date,

        priority: listDto.priority || 'MEDIUM',
        status: listDto.status || 'PENDING',

        lastUpdated: listDto.updated_at
    };
};

class PlanService {
    private readonly planListEndpoint = '/plan-lists';
    private readonly productPlanEndpoint = '/product-plans';

    async getAll(filter: PlanFilter): Promise<PaginatedResponse<Plan>> {
        const params: any = {
            page: filter.page || 1,
            limit: filter.limit || 10,
            sort_field: filter.sort_field || 'created_at',
            sort_order: filter.sort_order || 'DESC'
        };

        // Note: Backend might not support search/status filtering on plan-lists endpoint directly yet based on spec,
        // but passing them if supported or for future proofing.
        if (filter.status && filter.status !== 'all') {
            // Check if backend supports filter by status on GET /plan-lists. Spec doesn't explicitly say, but usually it does.
            // If not, we might need to filter client side or ask backend update.
            // For now assuming standard pattern.
        }

        const response = await apiClient.get<PaginatedResponse<PlanListDTO>>(`${this.planListEndpoint}`, { params });

        // Map DTOs to Domain
        return {
            ...response,
            data: response.data.map(mapCombinedToDomain)
        };
    }

    async getById(id: string): Promise<Plan | null> {
        try {
            const response = await apiClient.get<{ success: boolean, data: PlanListDTO }>(`${this.planListEndpoint}/${id}`);
            return mapCombinedToDomain(response.data);
        } catch (error) {
            console.error("Error fetching plan:", error);
            return null;
        }
    }

    async create(data: CreatePlanRequest): Promise<Plan> {
        // Step 1: Create Product Plan
        const productPlanPayload = {
            product_id: data.product_id,
            plan_name: data.plan_name,
            plan_description: data.plan_description || "",
            input_quantity: data.input_quantity,
            start_date: data.start_date,
            end_date: data.end_date
        };

        const planResponse = await apiClient.post<{ success: boolean, data: ProductPlanDTO }>(this.productPlanEndpoint, productPlanPayload);
        const newProductPlan = planResponse.data;

        // Step 2: Create Plan List (Linkage)
        const planListPayload = {
            plan_id: newProductPlan.id,
            priority: data.priority,
            status: data.status
        };

        const listResponse = await apiClient.post<{ success: boolean, data: PlanListDTO }>(this.planListEndpoint, planListPayload);

        // Manually stitch them together for return since POST /plan-lists might not return the full nested relation immediately? 
        // Spec example shows it returns plan_id, priority, status. It DOES NOT show nested 'plan'.
        // So we manually construct the domain object.
        const listResult = listResponse.data;
        listResult.plan = newProductPlan; // Inject for mapper

        return mapCombinedToDomain(listResult);
    }

    async update(id: string, data: UpdatePlanRequest): Promise<void> {
        // We typically update fields on two different entities.
        // First get the current plan to know IDs.
        const current = await this.getById(id);
        if (!current) throw new Error("Plan not found");

        const promises = [];

        // 1. Update Product Plan if needed
        if (data.plan_name || data.input_quantity || data.start_date || data.end_date || data.plan_description) {
            const productPlanUpdate: any = {};
            if (data.plan_name) productPlanUpdate.plan_name = data.plan_name;
            if (data.plan_description) productPlanUpdate.plan_description = data.plan_description;
            if (data.input_quantity) productPlanUpdate.input_quantity = data.input_quantity;
            if (data.start_date) productPlanUpdate.start_date = data.start_date;
            if (data.end_date) productPlanUpdate.end_date = data.end_date;

            promises.push(apiClient.put(`${this.productPlanEndpoint}/${current.productPlanId}`, productPlanUpdate));
        }

        // 2. Update Plan List if needed
        if (data.priority || data.status) {
            const planListUpdate: any = {};
            if (data.priority) planListUpdate.priority = data.priority;
            if (data.status) planListUpdate.status = data.status;

            promises.push(apiClient.put(`${this.planListEndpoint}/${current.planListId}`, planListUpdate));
        }

        await Promise.all(promises);
    }

    async delete(id: string): Promise<void> {
        // Deleting the PlanList is usually sufficient to "remove" it from the list.
        // Spec says Soft Delete for both.
        // We should probably delete the PlanList.
        await apiClient.delete(`${this.planListEndpoint}/${id}`);
    }

    async restore(id: string): Promise<void> {
        await apiClient.put(`${this.planListEndpoint}/${id}/restore`, {});
    }
}

export const planService = new PlanService();
