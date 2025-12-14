import { useState } from 'react';
import { CreatePlanRequest, UpdatePlanRequest } from '@/types/plan';
import { planService } from '@/services/plan.service';
import { addToast } from "@heroui/toast";
import { useTranslation } from "@/components/providers/language-provider";
import { useRouter } from 'next/navigation';
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";

export function usePlanCrud(onSuccess?: () => void) {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const createPlan = async (data: CreatePlanRequest) => {
        setSaving(true);
        try {
            await planService.create(data);
            addToast({ title: t("common.success"), color: "success" });
            if (onSuccess) onSuccess();
            else router.push(`${basePath}/plans`);
        } catch (error) {
            console.error(error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    const updatePlan = async (id: number | string, data: UpdatePlanRequest) => {
        setSaving(true);
        try {
            await planService.update(id.toString(), data);
            addToast({ title: t("common.success"), color: "success" });
            if (onSuccess) onSuccess();
            else router.push(`${basePath}/plans`);
        } catch (error) {
            console.error(error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    const deletePlan = async (id: number | string) => {
        setDeleting(true);
        try {
            await planService.delete(id.toString());
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
