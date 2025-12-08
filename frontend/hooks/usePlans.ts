import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService } from '@/services/plan.service';
import { Plan, PlanFilter, PlanStatus } from '@/types/plan';

export const usePlans = (filter: PlanFilter) => {
    return useQuery({
        queryKey: ['plans', filter],
        queryFn: () => planService.getAll(filter),
        keepPreviousData: true
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
        mutationFn: (data: Partial<Plan>) => planService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) => planService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            queryClient.invalidateQueries({ queryKey: ['plan', id] });
        }
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => planService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
    });
};

export const useUpdatePlanStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, comment }: { id: string; status: PlanStatus; comment?: string }) => {
            if (status === 'approved') return planService.approve(id, comment);
            if (status === 'rejected') return planService.reject(id, comment || '');
            throw new Error(`Invalid status transition to ${status}`);
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            queryClient.invalidateQueries({ queryKey: ['plan', id] });
        }
    });
};

export const useDuplicatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => planService.duplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
    });
};
