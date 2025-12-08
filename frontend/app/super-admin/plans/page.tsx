'use client';

import React from 'react';
import PlanTable from '@/components/plans/plan-table';
import PlanForm from '@/components/plans/plan-form';
import { Button } from '@heroui/button';
import { useTranslation } from '@/components/providers/language-provider';
import { Plus } from 'lucide-react';

export default function PlansPage() {
    const { t } = useTranslation();
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    return (
        <div className="p-6 h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{t('plan.title')}</h1>
                    <p className="text-default-500">Manage your production plans and schedules.</p>
                </div>
                <Button color="primary" startContent={<Plus />} onPress={() => setIsCreateOpen(true)}>
                    {t('plan.create')}
                </Button>
            </div>

            <PlanTable />

            <PlanForm
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
