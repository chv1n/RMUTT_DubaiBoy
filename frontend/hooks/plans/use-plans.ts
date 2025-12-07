import { useState, useCallback } from 'react';
import { Plan, PlanFilters } from '@/types/plan';
import { planService } from '@/services/plan.service';
import { addToast } from "@heroui/toast";
import { useTranslation } from "@/components/providers/language-provider";

export function usePlans() {
    const { t } = useTranslation();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<PlanFilters>({});

    const loadPlans = useCallback(async (currentFilters?: PlanFilters) => {
        setLoading(true);
        try {
            const data = await planService.getAll(currentFilters || filters);
            setPlans(data);
        } catch (error) {
            console.error(error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setLoading(false);
        }
    }, [filters, t]);

    return {
        plans,
        loading,
        filters,
        setFilters,
        loadPlans
    };
}
