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
import { useUpdatePlan, useDeletePlan, useStartPlan, useCompletePlan, useCancelPlan, useConfirmPlan, usePlanPreview } from '@/hooks/usePlans';
import PlanForm from './plan-form';
import { ConfirmPlanModal, CompletePlanModal, CancelPlanModal } from './plan-modals';
import { ConfirmModal } from '@/components/common/confirm-modal';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Skeleton } from "@heroui/skeleton";
import { usePermission } from "@/hooks/use-permission";
import { getRolePath } from "@/lib/role-path";

interface PlanDetailProps {
    plan: Plan;
}

export default function PlanDetail({ plan }: PlanDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { userRole } = usePermission();
    const basePath = getRolePath(userRole);
    const updatePlanMutation = useUpdatePlan();
    const deleteMutation = useDeletePlan();
    const startMutation = useStartPlan();
    const completeMutation = useCompletePlan();
    const cancelMutation = useCancelPlan();
    const confirmMutation = useConfirmPlan();

    // Fetch detailed preview (requirements)
    const { data: planPreview, isLoading: isPreviewLoading } = usePlanPreview(plan.id, true);

    // Modals
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    // Workflow Modals State
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [isCompleteOpen, setIsCompleteOpen] = React.useState(false);
    const [isCancelOpen, setIsCancelOpen] = React.useState(false);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [isStartConfirmOpen, setIsStartConfirmOpen] = React.useState(false);

    const handleDeleteClick = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(plan.id, {
            onSuccess: () => {
                setIsDeleteConfirmOpen(false);
                router.push(`${basePath}/plans`);
            }
        });
    };

    // --- Action Handlers (OPEN MODALS) ---

    const handleConfirmClick = () => setIsConfirmOpen(true);

    const handleStartClick = () => {
        setIsStartConfirmOpen(true);
    };

    const handleStartConfirm = () => {
        startMutation.mutate(plan.id, {
            onSuccess: () => setIsStartConfirmOpen(false)
        });
    };

    const handleCompleteClick = () => setIsCompleteOpen(true);

    const handleCancelClick = () => setIsCancelOpen(true);

    // --- Modal Submission Handlers ---

    const handleConfirmSubmit = (allocations: any[]) => {
        confirmMutation.mutate({ id: plan.id, allocations }, {
            onSuccess: () => setIsConfirmOpen(false)
        });
    }

    const handleCompleteSubmit = (qty: number) => {
        completeMutation.mutate({ id: plan.id, actualQuantity: qty }, {
            onSuccess: () => setIsCompleteOpen(false)
        });
    }

    const handleCancelSubmit = (reason: string, actualQty?: number) => {
        cancelMutation.mutate({ id: plan.id, reason }, {
            onSuccess: () => setIsCancelOpen(false)
        });
    }

    const statusColorMap: Record<PlanStatus, "success" | "danger" | "warning" | "default" | "primary" | "secondary"> = {
        DRAFT: "default",
        PENDING: "warning",
        PRODUCTION: "primary",
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
                    {plan.status === 'DRAFT' && (
                        <Button color="warning" variant="flat" startContent={<CheckCircle size={18} />} onPress={handleConfirmClick}>
                            {t('plan.confirmPlan')}
                        </Button>
                    )}
                    {plan.status === 'PENDING' && (
                        <Button color="primary" variant="flat" startContent={<PlayCircle size={18} />} onPress={handleStartClick}>
                            {t('plan.startPlan')}
                        </Button>
                    )}
                    {plan.status === 'PRODUCTION' && (
                        <Button color="success" variant="flat" startContent={<CheckCircle size={18} />} onPress={handleCompleteClick}>
                            {t('plan.complete')}
                        </Button>
                    )}
                    {plan.status !== 'CANCELLED' && plan.status !== 'COMPLETED' && (
                        <Button color="danger" variant="flat" startContent={<XCircle size={18} />} onPress={handleCancelClick}>
                            {t('plan.cancel')}
                        </Button>
                    )}

                    <Button variant="ghost" startContent={<Edit size={18} />} onPress={() => setIsEditOpen(true)}>
                        {t('plan.edit')}
                    </Button>

                    <Button variant="ghost" color="danger" startContent={<Trash2 size={18} />} onPress={handleDeleteClick}>
                        {t('common.delete')}
                    </Button>
                </div>
            </div>

            {/* Overview Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border border-default-100">
                    <CardHeader className="pb-0 px-4 pt-4 flex-col items-start gap-2">
                        <h4 className="font-bold text-large uppercase text-default-600">{t('plan.detail')}</h4>
                        <p className="text-small text-default-500">{plan.description || t('common.noData')}</p>
                    </CardHeader>
                    <CardBody className="overflow-visible py-4 block space-y-6">

                        {/* 1. Plan Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-default-500">{t('plan.field.name')}</span>
                                <span className="font-semibold text-foreground">{plan.name}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-default-500">{t('products.fields.product')}</span>
                                <span className="font-semibold text-foreground">{plan.productName}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-default-500">{t('plan.field.quantity')}</span>
                                <span className="font-semibold text-foreground">{plan.quantity}</span>
                            </div>
                            {plan.actualProducedQuantity !== undefined && plan.actualProducedQuantity !== null && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-default-500">{t('plan.actual')}</span>
                                    <span className="font-semibold text-success">{plan.actualProducedQuantity}</span>
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* 2. Estimated Cost */}
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-default-500">Estimated Cost</span>
                            {isPreviewLoading ? (
                                <Skeleton className="h-6 w-32 rounded-lg" />
                            ) : (
                                <span className="text-xl font-bold text-success">
                                    ฿{planPreview?.estimated_cost ? planPreview.estimated_cost.toLocaleString() : '0.00'}
                                </span>
                            )}
                        </div>

                        <Divider />

                        {/* 3. Material Requirements Table */}
                        <div className="flex flex-col gap-2">
                            <h5 className="font-semibold text-default-700">Material Requirements</h5>
                            {isPreviewLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="rounded-lg h-10 w-full" />
                                    <Skeleton className="rounded-lg h-10 w-full" />
                                    <Skeleton className="rounded-lg h-10 w-full" />
                                </div>
                            ) : (
                                <Table aria-label="Material Requirements" removeWrapper>
                                    <TableHeader>
                                        <TableColumn>Material</TableColumn>
                                        <TableColumn>Usage/Pc</TableColumn>
                                        <TableColumn>Scrap %</TableColumn>
                                        <TableColumn>Net Qty</TableColumn>
                                        <TableColumn>Scrap Qty</TableColumn>
                                        <TableColumn>Total Req</TableColumn>
                                        <TableColumn>Unit Cost</TableColumn>
                                        <TableColumn>Total Cost</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent={t('common.noData')}>
                                        {(planPreview?.materials || []).map((mat) => (
                                            <TableRow key={mat.material_id}>
                                                <TableCell>{mat.material_name}</TableCell>
                                                <TableCell>{mat.usage_per_piece}</TableCell>
                                                <TableCell>{mat.scrap_factor ? `${(mat.scrap_factor * 100).toFixed(1)}%` : '-'}</TableCell>
                                                <TableCell>{mat.net_quantity?.toLocaleString() || '-'}</TableCell>
                                                <TableCell>{mat.scrap_quantity?.toLocaleString() || '-'}</TableCell>
                                                <TableCell className="font-semibold">{mat.required_quantity.toLocaleString()}</TableCell>
                                                <TableCell>{mat.unit_cost ? `฿${mat.unit_cost.toLocaleString()}` : '-'}</TableCell>
                                                <TableCell className="text-success font-semibold">
                                                    {mat.total_cost ? `฿${mat.total_cost.toLocaleString()}` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

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
                                <span className="text-default-500 text-sm">{t('plan.priorityTitle')}</span>
                                <Chip color={priorityColorMap[plan.priority]} variant="flat" size="sm" className="capitalize">
                                    {plan.priority}
                                </Chip>
                            </div>
                            <Divider />
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 text-sm">{t('products.fields.name')}</span>
                                <span className="font-medium text-right text-sm">{plan.productName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 text-sm">{t('plan.quantity')}</span>
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
                            <span>{t('plan.field.updated') || 'Last Updated'}: {new Date(plan.lastUpdated).toLocaleString()}</span>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <PlanForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} planToEdit={plan} />

            <ConfirmPlanModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmSubmit}
                planId={plan.id}
                isProcessing={confirmMutation.isPending}
            />

            <CompletePlanModal
                isOpen={isCompleteOpen}
                onClose={() => setIsCompleteOpen(false)}
                onComplete={handleCompleteSubmit}
                inputQuantity={plan.quantity}
                isProcessing={completeMutation.isPending}
            />

            <CancelPlanModal
                isOpen={isCancelOpen}
                onClose={() => setIsCancelOpen(false)}
                onCancel={handleCancelSubmit}
                isProduction={plan.status === 'PRODUCTION'}
                inputQuantity={plan.quantity}
                isProcessing={cancelMutation.isPending}
            />

            {/* General Confirmation Modals */}
            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t('plan.deletePlanTitle')}
                message={t('plan.deletePlanMessage')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

            <ConfirmModal
                isOpen={isStartConfirmOpen}
                onClose={() => setIsStartConfirmOpen(false)}
                onConfirm={handleStartConfirm}
                title={t('plan.startPlanTitle')}
                message={t('plan.startPlanMessage')}
                confirmText={t('plan.startPlan')}
                cancelText={t('common.cancel')}
                variant="primary"
                isLoading={startMutation.isPending}
            />
        </div>
    );
}
