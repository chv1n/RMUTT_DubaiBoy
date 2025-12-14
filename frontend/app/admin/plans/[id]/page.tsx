'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PlanDetail from '@/components/plans/plan-detail';
import { usePlan } from '@/hooks/usePlans';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from '@/components/providers/language-provider';

export default function PlanDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: plan, isLoading, error } = usePlan(id);
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex h-full w-full justify-center items-center">
                <Spinner size="lg" label="Loading Plan..." />
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="flex h-full w-full justify-center items-center flex-col gap-4">
                <AlertCircle size={48} className="text-danger" />
                <h2 className="text-xl font-bold">Plan Not Found</h2>
                <p>The plan you are looking for does not exist or an error occurred.</p>
                <Button color="primary" variant="flat" onPress={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="p-6 h-full">
            <PlanDetail plan={plan} />
        </div>
    );
}
