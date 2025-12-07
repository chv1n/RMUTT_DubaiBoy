import { useState } from 'react';
import { CreatePlanDTO, UpdatePlanDTO } from '@/types/plan';
import { planService } from '@/services/plan.service';
import { addToast } from "@heroui/toast";
import { useTranslation } from "@/components/providers/language-provider";
import { useRouter } from 'next/navigation';

export function usePlanCrud(onSuccess?: () => void) {
    const { t } = useTranslation();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const createPlan = async (data: CreatePlanDTO) => {
        setSaving(true);
        try {
            await planService.create(data);
            addToast({ title: t("common.success"), color: "success" });
            if (onSuccess) onSuccess();
            else router.push('/super-admin/plans');
        } catch (error) {
            console.error(error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    const updatePlan = async (id: number, data: UpdatePlanDTO) => {
        setSaving(true);
        try {
            await planService.update(id, data);
            addToast({ title: t("common.success"), color: "success" });
            if (onSuccess) onSuccess();
            else router.push('/super-admin/plans');
        } catch (error) {
            console.error(error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    const deletePlan = async (id: number) => {
        setDeleting(true);
        try {
            await planService.delete(id);
            addToast({ title: t("common.success"), color: "success" });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setDeleting(false);
        }
    };

    return {
        createPlan,
        updatePlan,
        deletePlan,
        saving,
        deleting
    };
}
