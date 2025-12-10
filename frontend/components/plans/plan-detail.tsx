'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { useTranslation } from '@/components/providers/language-provider';
import { Plan, PlanStatus, PlanPriority } from '@/types/plan';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Calendar, Package, PlayCircle, StopCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUpdatePlan, useDeletePlan } from '@/hooks/usePlans';
import PlanForm from './plan-form';

interface PlanDetailProps {
    plan: Plan;
}

export default function PlanDetail({ plan }: PlanDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const updatePlanMutation = useUpdatePlan();
    const deleteMutation = useDeletePlan();

    // Modals
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    const handleDelete = () => {
        if (confirm(t('common.confirmDeleteMessage'))) {
            deleteMutation.mutate(plan.id, {
                onSuccess: () => router.push('/super-admin/plans')
            });
        }
    };

    const handleStatusChange = (newStatus: PlanStatus) => {
        updatePlanMutation.mutate({ id: plan.id, data: { status: newStatus } });
    };

    const statusColorMap: Record<PlanStatus, "success" | "danger" | "warning" | "default" | "primary"> = {
        PENDING: "default",
        IN_PROGRESS: "primary",
        COMPLETED: "success",
        CANCELLED: "danger",
    };

    const priorityColorMap: Record<PlanPriority, "success" | "danger" | "warning" | "default" | "primary"> = {
        LOW: "success",
        MEDIUM: "primary",
        HIGH: "warning",
        URGENT: "danger"
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="flat" onPress={() => router.back()} className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                {plan.name}
                            </h1>
                            <Chip size="sm" variant="dot" color={statusColorMap[plan.status]} className="capitalize border-none">
                                {plan.status}
                            </Chip>
                        </div>
                        <p className="text-default-500 font-mono text-sm">{plan.planCode}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Actions */}
                    {plan.status === 'PENDING' && (
                        <Button color="primary" variant="flat" startContent={<PlayCircle size={18} />} onPress={() => handleStatusChange('IN_PROGRESS')}>
                            Start Plan
                        </Button>
                    )}
                    {plan.status === 'IN_PROGRESS' && (
                        <Button color="success" variant="flat" startContent={<CheckCircle size={18} />} onPress={() => handleStatusChange('COMPLETED')}>
                            Complete
                        </Button>
                    )}
                    {plan.status !== 'CANCELLED' && plan.status !== 'COMPLETED' && (
                        <Button color="danger" variant="flat" startContent={<XCircle size={18} />} onPress={() => handleStatusChange('CANCELLED')}>
                            Cancel
                        </Button>
                    )}

                    <Button variant="ghost" startContent={<Edit size={18} />} onPress={() => setIsEditOpen(true)}>
                        {t('plan.edit')}
                    </Button>

                    <Button variant="ghost" color="danger" startContent={<Trash2 size={18} />} onPress={handleDelete}>
                        {t('common.delete')}
                    </Button>
                </div>
            </div>

            {/* Overview Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="pb-0 px-4 pt-4 flex-col items-start">
                        <h4 className="font-bold text-large uppercase text-default-600">{t('plan.field.description')}</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-4 block">
                        <p className="text-default-500 whitespace-pre-wrap">
                            {plan.description || '-'}
                        </p>
                    </CardBody>
                </Card>

                {/* Side Info */}
                <div className="space-y-4">
                    <Card className="shadow-sm border border-default-100">
                        <CardBody className="gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 text-sm">{t('plan.field.status')}</span>
                                <Chip color={statusColorMap[plan.status]} variant="flat" size="sm" className="capitalize">
                                    {plan.status}
                                </Chip>
                            </div>
                            <Divider />
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 text-sm">Priority</span>
                                <Chip color={priorityColorMap[plan.priority]} variant="flat" size="sm" className="capitalize">
                                    {plan.priority}
                                </Chip>
                            </div>
                            <Divider />
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 text-sm">Product</span>
                                <span className="font-medium text-right text-sm">{plan.productName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 text-sm">Quantity</span>
                                <div className="flex items-center gap-1 font-medium">
                                    <Package size={14} className="text-default-400" />
                                    {plan.quantity}
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm border border-default-100 bg-primary-50/50">
                        <CardBody className="flex flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-lg text-primary">
                                    <Calendar size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-default-500">{t('plan.field.start_date')}</span>
                                    <span className="text-sm font-semibold">{plan.startDate}</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-divider" />
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-default-500">{t('plan.field.end_date')}</span>
                                <span className="text-sm font-semibold">{plan.endDate}</span>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm border border-default-100">
                        <CardBody className="flex flex-row items-center gap-2 text-default-400 text-xs">
                            <Clock size={14} />
                            <span>Last Updated: {new Date(plan.lastUpdated).toLocaleString()}</span>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <PlanForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} planToEdit={plan} />
        </div>
    );
}

