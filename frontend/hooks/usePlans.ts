import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService } from '@/services/plan.service';
import { PlanFilter, CreatePlanRequest, UpdatePlanRequest, PlanStatus } from '@/types/plan';

export const usePlans = (filter: PlanFilter) => {
    return useQuery({
        queryKey: ['plans', filter],
        queryFn: () => planService.getAll(filter)
        // keepPreviousData is deprecated in V5? using placeholderData if needed, but keeping simple for now
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
        }
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) => planService.update(id, data),
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

export const useRestorePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => planService.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
    });
};

