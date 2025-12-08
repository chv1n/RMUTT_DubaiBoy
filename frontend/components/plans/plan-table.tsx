'use client';

import React from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Pagination } from '@heroui/pagination';
import { Spinner } from '@heroui/spinner';
import { Chip } from '@heroui/chip';
import { useTranslation } from '@/components/providers/language-provider';
import { Plan } from '@/types/plan';
import { usePlans, useDeletePlan, useUpdatePlanStatus, useDuplicatePlan } from '@/hooks/usePlans';
import { Search, Plus, Filter, ArrowUpDown, LayoutGrid, List, Flame, Plane, Eye, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Selection, SortDescriptor } from '@heroui/table';
import PlanForm from './plan-form';
import PlanCard from './plan-card';

export default function PlanTable() {
    const { t, locale } = useTranslation();
    const router = useRouter();
    const [filterValue, setFilterValue] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
    const [view, setView] = React.useState<"list" | "board">("list");
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [planToEdit, setPlanToEdit] = React.useState<Plan | null>(null);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "last_updated",
        direction: "descending",
    });

    // Hooks
    const deletePlanMutation = useDeletePlan();
    const updateStatusMutation = useUpdatePlanStatus();
    const duplicateMutation = useDuplicatePlan();

    // Data Fetching
    const { data, isLoading } = usePlans({
        search: filterValue,
        status: statusFilter !== "all" && statusFilter.size > 0 ? Array.from(statusFilter)[0] as any : undefined,
        sort_by: sortDescriptor.column as any,
        sort_desc: sortDescriptor.direction === "descending"
    });

    // Handlers
    const onSearchChange = (value: string) => setFilterValue(value);
    const onClear = () => setFilterValue("");

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

    const handleAction = React.useCallback((key: string, plan: Plan) => {
        switch (key) {
            case 'view':
                router.push(`/super-admin/plans/${plan.id}`);
                break;
            case 'edit':
                handleEdit(plan);
                break;
            case 'duplicate':
                duplicateMutation.mutate(plan.id);
                break;
            case 'delete':
                if (confirm(t('common.confirmDeleteMessage'))) {
                    deletePlanMutation.mutate(plan.id);
                }
                break;
            case 'approve':
                updateStatusMutation.mutate({ id: plan.id, status: 'approved' });
                break;
            case 'reject':
                updateStatusMutation.mutate({ id: plan.id, status: 'rejected', comment: 'Rejected by admin' });
                break;
        }
    }, [deletePlanMutation, duplicateMutation, router, t, updateStatusMutation]);

    // Drag and Drop Logic
    const [draggedPlan, setDraggedPlan] = React.useState<Plan | null>(null);

    const handleDragStart = (e: React.DragEvent, plan: Plan) => {
        setDraggedPlan(plan);
        e.dataTransfer.effectAllowed = "move";
        // Optional: Set drag image
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetStatusGroup: string) => {
        e.preventDefault();

        if (!draggedPlan) return;

        const groupToStatus: Record<string, string> = {
            "Action Required": "submitted",
            "Active": "active",
            "Drafts": "draft",
            "Finished": "approved"
        };

        const newStatus = groupToStatus[targetStatusGroup];

        if (!newStatus || draggedPlan.status === newStatus) {
            setDraggedPlan(null);
            return;
        }

        updateStatusMutation.mutate({
            id: draggedPlan.id,
            status: newStatus as any
        });

        setDraggedPlan(null);
    };

    // Grouping Logic
    const groupedPlans = React.useMemo(() => {
        if (!data?.data) return {};

        const groups: Record<string, Plan[]> = {
            "Action Required": [],
            "Active": [],
            "Drafts": [],
            "Finished": []
        };

        data.data.forEach(plan => {
            if (plan.status === 'submitted') groups["Action Required"].push(plan);
            else if (plan.status === 'active') groups["Active"].push(plan);
            else if (plan.status === 'draft') groups["Drafts"].push(plan);
            else groups["Finished"].push(plan);
        });

        // For board view, keep all keys to maintain structure, for list view clean up
        if (view === 'list') {
            Object.keys(groups).forEach(key => {
                if (groups[key].length === 0) delete groups[key];
            });
        }

        return groups;
    }, [data, view]);

    const renderBoardView = () => (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
            {Object.entries(groupedPlans).map(([groupName, plans]) => (
                <div
                    key={groupName}
                    className={`min-w-[300px] w-full bg-default-50 rounded-xl p-3 flex flex-col gap-3 transition-colors duration-200 ${draggedPlan ? 'border-2 border-dashed border-primary-200 hover:bg-primary-50' : 'border-2 border-transparent'}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, groupName)}
                >
                    <div className="flex items-center gap-2 mb-2 px-1">
                        {groupName === 'Action Required' && <Flame size={18} className="text-warning" />}
                        {groupName === 'Active' && <Plane size={18} className="text-primary" />}
                        {groupName === 'Drafts' && <Eye size={18} className="text-default-400" />}
                        {groupName === 'Finished' && <CheckCircle size={18} className="text-success" />}
                        <h3 className="font-semibold text-default-700">{groupName}</h3>
                        <Chip size="sm" variant="flat" className="ml-auto">{plans.length}</Chip>
                    </div>
                    {plans.map(plan => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onAction={handleAction}
                            viewMode="board"
                            draggable
                            onDragStart={handleDragStart}
                        />
                    ))}
                    {plans.length === 0 && (
                        <div className="h-20 flex items-center justify-center text-default-300 text-sm border-2 border-dashed border-default-200 rounded-lg">
                            {t('common.noData')}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    if (isLoading) {
        return <div className="w-full h-96 flex items-center justify-center"><Spinner size="lg" /></div>;
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <PlanForm isOpen={isFormOpen} onClose={handleFormClose} planToEdit={planToEdit} />

            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-content1 p-4 rounded-xl shadow-sm">
                <div className="flex gap-2 w-full sm:w-auto flex-1">
                    <Input
                        isClearable
                        placeholder={t('plan.search')}
                        startContent={<Search size={18} className="text-default-400" />}
                        value={filterValue}
                        onClear={onClear}
                        onValueChange={onSearchChange}
                        className="w-full sm:max-w-md"
                        classNames={{
                            inputWrapper: "bg-default-100",
                        }}
                    />
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="flat" startContent={<Filter size={18} />}>
                                {statusFilter !== "all" && statusFilter.size > 0
                                    ? t(`plan.filter.${Array.from(statusFilter)[0]}`)
                                    : t('common.filter')}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Status Filter"
                            closeOnSelect={false}
                            selectedKeys={statusFilter}
                            selectionMode="single"
                            onSelectionChange={setStatusFilter}
                        >
                            <DropdownItem key="all">{t('plan.filter.all')}</DropdownItem>
                            <DropdownItem key="draft">{t('plan.filter.draft')}</DropdownItem>
                            <DropdownItem key="submitted">{t('plan.filter.submitted')}</DropdownItem>
                            <DropdownItem key="active">{t('plan.filter.active')}</DropdownItem>
                            <DropdownItem key="approved">{t('plan.filter.approved')}</DropdownItem>
                            <DropdownItem key="rejected">{t('plan.filter.rejected')}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="flat" startContent={<ArrowUpDown size={18} />}>
                                {sortDescriptor.column === 'last_updated'
                                    ? t('plan.sort.date')
                                    : sortDescriptor.column === 'name'
                                        ? t('plan.sort.name')
                                        : t('plan.sort.status')}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Sort Actions">
                            <DropdownItem key="date_desc" onPress={() => setSortDescriptor({ column: 'last_updated', direction: 'descending' })}>{t('plan.sort.date')} (Newest)</DropdownItem>
                            <DropdownItem key="date_asc" onPress={() => setSortDescriptor({ column: 'last_updated', direction: 'ascending' })}>{t('plan.sort.date')} (Oldest)</DropdownItem>
                            <DropdownItem key="name_asc" onPress={() => setSortDescriptor({ column: 'name', direction: 'ascending' })}>{t('plan.sort.name')} (A-Z)</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <div className="bg-default-100 p-1 rounded-lg flex gap-1">
                        <Button
                            size="sm"
                            variant={view === 'board' ? 'solid' : 'light'}
                            color={view === 'board' ? 'primary' : 'default'}
                            isIconOnly
                            onPress={() => setView('board')}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            size="sm"
                            variant={view === 'list' ? 'solid' : 'light'}
                            color={view === 'list' ? 'primary' : 'default'}
                            startContent={<List size={16} />}
                            onPress={() => setView('list')}
                        >
                            List
                        </Button>
                    </div>

                </div>
            </div>

            {/* Content Switcher */}
            {view === 'board' ? renderBoardView() : (
                <div className="flex flex-col gap-8">
                    {Object.entries(groupedPlans).map(([groupName, plans]) => (
                        <div key={groupName} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1 pl-1">
                                {groupName === 'Action Required' && <Flame size={20} className="text-warning" />}
                                {groupName === 'Active' && <Plane size={20} className="text-primary" />}
                                {groupName === 'Drafts' && <Eye size={20} className="text-default-400" />}
                                {groupName === 'Finished' && <CheckCircle size={20} className="text-success" />}

                                <h2 className="text-lg font-semibold text-default-700">{groupName}</h2>
                                <Chip size="sm" variant="flat" color="default">{plans.length}</Chip>
                            </div>

                            {plans.map(plan => (
                                <PlanCard key={plan.id} plan={plan} onAction={handleAction} />
                            ))}
                        </div>
                    ))}

                    {(!data?.data || data.data.length === 0) && (
                        <div className="text-center py-10 text-default-400">
                            {t('common.noData')}
                        </div>
                    )}
                    <div className="flex justify-center mt-4">
                        <Pagination total={data?.meta.total_pages || 1} initialPage={1} color="primary" />
                    </div>
                </div>
            )}
        </div>
    );
}
