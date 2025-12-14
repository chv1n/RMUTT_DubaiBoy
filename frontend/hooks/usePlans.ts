import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService } from '@/services/plan.service';
import { PlanFilter, CreatePlanRequest, UpdatePlanRequest, PlanStatus } from '@/types/plan';
import { addToast } from "@heroui/toast";

const handleError = (error: any) => {
    const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || "An unexpected error occurred";
    console.log(error)
    addToast({
        title: "Error",
        description: message,
        color: "danger",
    });
};

export const usePlans = (filter: PlanFilter) => {
    return useQuery({
        queryKey: ['plans', filter],
        queryFn: () => planService.getAll(filter)
    });
};

export const usePlan = (id: string) => {
    return useQuery({
        queryKey: ['plan', id],
        queryFn: () => planService.getById(id),
        enabled: !!id
    });
};

export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePlanRequest) => planService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            // Also invalidate stats if we had a query for it
            queryClient.invalidateQueries({ queryKey: ['plan-stats'] });
            addToast({ title: "Plan created successfully", color: "success" });
        },
        onError: handleError
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) => planService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            queryClient.invalidateQueries({ queryKey: ['plan', id] });
            queryClient.invalidateQueries({ queryKey: ['plan-stats'] });
            addToast({ title: "Plan updated successfully", color: "success" });
        },
        onError: handleError
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => planService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            queryClient.invalidateQueries({ queryKey: ['plan-stats'] });
            addToast({ title: "Plan deleted successfully", color: "success" });
        },
        onError: handleError
    });
};

export const useRestorePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => planService.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
    });
};

// --- Workflow Mutations ---

export const useStartPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => planService.start(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['plan', id] });
            queryClient.invalidateQueries({ queryKey: ['plan-stats'] });
            addToast({ title: "Production started", color: "success" });
        },
        onError: handleError
    });
};

export const useCompletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, actualQuantity }: { id: string; actualQuantity: number }) => planService.complete(id, actualQuantity),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['plan', id] });
            queryClient.invalidateQueries({ queryKey: ['plan-stats'] });
            addToast({ title: "Plan completed", color: "success" });
        },
        onError: handleError
    });
};

export const useCancelPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => planService.cancel(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['plan', id] });
            queryClient.invalidateQueries({ queryKey: ['plan-stats'] });
            addToast({ title: "Plan cancelled", color: "success" });
        },
        onError: handleError
    });
};

export const useConfirmPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // allocations would normally be collected from a modal. Passing empty array or allowing data inject.
        mutationFn: ({ id, allocations }: { id: string; allocations: any[] }) => planService.confirm(id, allocations),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['plan', id] });
            queryClient.invalidateQueries({ queryKey: ['plan-stats'] });
            addToast({ title: "Plan confirmed", color: "success" });
        },
        onError: handleError
    });
};

export const usePlanPreview = (id: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['plan-preview', id],
        queryFn: () => planService.getPreview(id),
        enabled: enabled && !!id
    });
};
