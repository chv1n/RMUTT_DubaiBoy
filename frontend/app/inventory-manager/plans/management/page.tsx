"use client";

import React from 'react';
import PlanTable from '@/components/plans/plan-table';
import { Button } from '@heroui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/components/providers/language-provider';
import PlanForm from '@/components/plans/plan-form';
import { Plan } from '@/types/plan';

export default function PlanManagementPage() {
    const { t } = useTranslation();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [planToEdit, setPlanToEdit] = React.useState<Plan | null>(null);

    const handleCreate = () => {
        setPlanToEdit(null);
        setIsFormOpen(true);
    };

    const handleEdit = (plan: Plan) => {
        setPlanToEdit(plan);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setPlanToEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">{t("plan.title")}</h1>
                    <p className="text-small text-default-500">{t("plan.subtext.overview")}</p>
                </div>
                <Button color="primary" onPress={handleCreate} startContent={<Plus size={18} />}>
                    {t('plan.create')}
                </Button>
            </div>

            <PlanTable onEdit={handleEdit} />

            <PlanForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                planToEdit={planToEdit}
            />
        </div>
    );
}
