'use client';

import React from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { User } from '@heroui/user';
import { Divider } from '@heroui/divider';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Textarea } from '@heroui/input';
import { useTranslation } from '@/components/providers/language-provider';
import { Plan } from '@/types/plan';
import { FileText, List, History, Download, ArrowLeft, Edit, Copy, Trash2, CheckCircle, XCircle, Calendar, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUpdatePlanStatus, useDuplicatePlan, useDeletePlan } from '@/hooks/usePlans';
import PlanForm from './plan-form';

interface PlanDetailProps {
    plan: Plan;
}

export default function PlanDetail({ plan }: PlanDetailProps) {
    const { t, locale } = useTranslation();
    const router = useRouter();
    const updateStatusMutation = useUpdatePlanStatus();
    const duplicateMutation = useDuplicatePlan();
    const deleteMutation = useDeletePlan();

    // Modals
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const { isOpen: isRejectOpen, onOpen: onRejectOpen, onOpenChange: onRejectOpenChange } = useDisclosure();
    const [rejectReason, setRejectReason] = React.useState('');

    const handleDuplicate = () => {
        duplicateMutation.mutate(plan.id, {
            onSuccess: () => {
                // Optionally redirect or show toast
                router.push('/super-admin/plans');
            }
        });
    };

    const handleDelete = () => {
        if (confirm(t('common.confirmDeleteMessage'))) {
            deleteMutation.mutate(plan.id, {
                onSuccess: () => router.push('/super-admin/plans')
            });
        }
    };

    const handleApprove = () => {
        updateStatusMutation.mutate({ id: plan.id, status: 'approved' });
    };

    const handleReject = () => {
        updateStatusMutation.mutate({ id: plan.id, status: 'rejected', comment: rejectReason });
        onRejectOpenChange(); // Close modal
    };

    const statusColorMap: Record<string, "success" | "danger" | "warning" | "default" | "primary"> = {
        active: "success",
        submitted: "warning",
        draft: "default",
        rejected: "danger",
        approved: "success",
        inactive: "default",
    };

    // Sub-components for Tabs
    const OverviewTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info */}
            <Card className="col-span-1 md:col-span-2 shadow-sm border border-default-100">
                <CardHeader className="pb-0 px-4 pt-4 flex-col items-start">
                    <h4 className="font-bold text-large uppercase text-default-600">{t('plan.field.description')}</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4 block">
                    <p className="text-default-500 whitespace-pre-wrap">
                        {plan.description?.[locale as 'en' | 'th' | 'ja'] || plan.description?.en || '-'}
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
                                {t(`plan.status.${plan.status}`)}
                            </Chip>
                        </div>
                        <Divider />
                        <div>
                            <span className="text-default-500 text-sm block mb-1">{t('plan.field.owner')}</span>
                            <User
                                name={plan.owner.name}
                                description={plan.owner.email}
                                avatarProps={{ src: plan.owner.avatar, size: "sm" }}
                            />
                        </div>
                        <Divider />
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-default-500 text-sm block mb-1">{t('plan.field.type')}</span>
                                <span className="font-medium capitalize">{plan.type}</span>
                            </div>
                            <div>
                                <span className="text-default-500 text-sm block mb-1">{t('plan.field.items')}</span>
                                <span className="font-medium">{plan.items_count} items</span>
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
                                <span className="text-sm font-semibold">{plan.start_date}</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-divider" />
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-default-500">{t('plan.field.end_date')}</span>
                            <span className="text-sm font-semibold">{plan.end_date}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );

    const ItemsTab = () => (
        <Card className="shadow-sm border border-default-100">
            <CardBody className="p-0">
                <Table aria-label="Plan Items" shadow="none" classNames={{ wrapper: "rounded-none shadow-none" }}>
                    <TableHeader>
                        <TableColumn>Material Code</TableColumn>
                        <TableColumn>Material Name</TableColumn>
                        <TableColumn>Qty</TableColumn>
                        <TableColumn>UOM</TableColumn>
                        <TableColumn>Remarks</TableColumn>
                    </TableHeader>
                    <TableBody items={plan.items} emptyContent="No items found">
                        {(item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.material_code}</TableCell>
                                <TableCell>{item.material_name}</TableCell>
                                <TableCell>{item.qty}</TableCell>
                                <TableCell>{item.uom}</TableCell>
                                <TableCell className="text-default-400">{item.remarks || '-'}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );

    const HistoryTab = () => (
        <Card className="shadow-sm border border-default-100 p-6">
            <div className="relative border-l border-default-200 ml-3 space-y-8">
                {plan.history && plan.history.length > 0 ? plan.history.map((h, idx) => (
                    <div key={h.id || idx} className="relative pl-8">
                        {/* Dot */}
                        <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ${h.action === 'approved' ? 'bg-success' : h.action === 'rejected' ? 'bg-danger' : 'bg-primary'}`} />

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-default-400">{new Date(h.timestamp).toLocaleString(locale)}</span>
                            <p className="text-sm font-semibold capitalize text-foreground">
                                {h.action.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-default-500">by {h.user.name}</p>
                            {h.comment && (
                                <div className="mt-2 p-3 bg-default-50 rounded-lg text-sm text-default-600 italic border border-default-200">
                                    "{h.comment}"
                                </div>
                            )}
                        </div>
                    </div>
                )) : <p className="ml-8 text-default-400">No history available.</p>}
            </div>
        </Card>
    );

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
                                {plan.name[locale as 'en' | 'th' | 'ja'] || plan.name.en}
                            </h1>
                            <Chip size="sm" variant="dot" color={statusColorMap[plan.status]} className="capitalize border-none">
                                {plan.status}
                            </Chip>
                        </div>
                        <p className="text-default-500 font-mono text-sm">{plan.plan_code}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary Actions based on Status */}
                    {plan.status === 'submitted' && (
                        <>
                            <Button color="success" variant="flat" startContent={<CheckCircle size={18} />} onPress={handleApprove}>
                                {t('plan.approve')}
                            </Button>
                            <Button color="danger" variant="flat" startContent={<XCircle size={18} />} onPress={onRejectOpen}>
                                {t('plan.reject')}
                            </Button>
                        </>
                    )}

                    <Button variant="ghost" startContent={<Edit size={18} />} onPress={() => setIsEditOpen(true)}>
                        {t('plan.edit')}
                    </Button>
                    <Button variant="ghost" startContent={<Copy size={18} />} onPress={handleDuplicate}>
                        {t('plan.duplicate')}
                    </Button>
                    <Button variant="ghost" color="danger" startContent={<Trash2 size={18} />} onPress={handleDelete}>
                        {t('common.delete')}
                    </Button>
                </div>
            </div>

            {/* Error/Success Messages from mutations could go here in a real app, typically handled by Toaster */}

            {/* Content Tabs */}
            <Tabs aria-label="Plan Details" color="primary" variant="underlined">
                <Tab key="overview" title={
                    <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span>Overview</span>
                    </div>
                }>
                    <OverviewTab />
                </Tab>
                <Tab key="items" title={
                    <div className="flex items-center gap-2">
                        <Package size={16} />
                        <span>Items ({plan.items.length})</span>
                    </div>
                }>
                    <ItemsTab />
                </Tab>
                <Tab key="history" title={
                    <div className="flex items-center gap-2">
                        <History size={16} />
                        <span>History</span>
                    </div>
                }>
                    <HistoryTab />
                </Tab>
                <Tab key="documents" title={
                    <div className="flex items-center gap-2">
                        <Download size={16} />
                        <span>Documents</span>
                    </div>
                }>
                    <Card className="shadow-none border border-default-200 p-8 flex flex-col items-center justify-center text-default-400 border-dashed">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p>No documents uploaded yet.</p>
                        <Button size="sm" variant="flat" className="mt-4">Upload Document (Mock)</Button>
                    </Card>
                </Tab>
            </Tabs>

            {/* Edit Modal */}
            <PlanForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} planToEdit={plan} />

            {/* Reject Reason Modal */}
            <Modal isOpen={isRejectOpen} onOpenChange={onRejectOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Reject Plan</ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-default-500 mb-2">Please provide a reason for rejecting this plan.</p>
                                <Textarea
                                    label="Reason"
                                    placeholder="Enter rejection reason..."
                                    value={rejectReason}
                                    onValueChange={setRejectReason}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={handleReject} isDisabled={!rejectReason.trim()}>
                                    Confirm Reject
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

