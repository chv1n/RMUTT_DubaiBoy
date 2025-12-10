'use client';

import React from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Pagination } from '@heroui/pagination';
import { Spinner } from '@heroui/spinner';
import { Chip } from '@heroui/chip';
import { useTranslation } from '@/components/providers/language-provider';
import { Plan, PlanStatus } from '@/types/plan';
import { usePlans, useDeletePlan, useUpdatePlan } from '@/hooks/usePlans';
import { Search, Filter, ArrowUpDown, LayoutGrid, List, Flame, Plane, Eye, CheckCircle, Clock, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Selection, SortDescriptor } from '@heroui/table';
import PlanCard from './plan-card';

interface PlanTableProps {
    onEdit: (plan: Plan) => void;
}

export default function PlanTable({ onEdit }: PlanTableProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [filterValue, setFilterValue] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
    const [view, setView] = React.useState<"list" | "board">("list");
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "lastUpdated",
        direction: "descending",
    });

    // Hooks
    const deletePlanMutation = useDeletePlan();
    const updatePlanMutation = useUpdatePlan();

    // Data Fetching
    const { data, isLoading } = usePlans({
        search: filterValue,
        status: statusFilter !== "all" && statusFilter.size > 0 ? Array.from(statusFilter)[0] as any : undefined,
        sort_field: sortDescriptor.column as string,
        sort_order: sortDescriptor.direction === "descending" ? 'DESC' : 'ASC'
    });

    // Handlers
    const onSearchChange = (value: string) => setFilterValue(value);
    const onClear = () => setFilterValue("");

    const handleAction = React.useCallback((key: string, plan: Plan) => {
        switch (key) {
            case 'view':
                router.push(`/super-admin/plans/${plan.id}`);
                break;
            case 'edit':
                onEdit(plan);
                break;
            case 'delete':
                if (confirm(t('common.confirmDeleteMessage'))) {
                    deletePlanMutation.mutate(plan.id);
                }
                break;
        }
    }, [deletePlanMutation, router, t, onEdit]);

    // Drag and Drop Logic
    const [draggedPlan, setDraggedPlan] = React.useState<Plan | null>(null);

    const handleDragStart = (e: React.DragEvent, plan: Plan) => {
        setDraggedPlan(plan);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetStatusGroup: PlanStatus) => {
        e.preventDefault();

        if (!draggedPlan) return;

        if (draggedPlan.status === targetStatusGroup) {
            setDraggedPlan(null);
            return;
        }

        updatePlanMutation.mutate({
            id: draggedPlan.id,
            data: { status: targetStatusGroup }
        });

        setDraggedPlan(null);
    };

    // Grouping Logic
    const groupedPlans = React.useMemo(() => {
        if (!data?.data) return {};

        const groups: Record<PlanStatus, Plan[]> = {
            "PENDING": [],
            "IN_PROGRESS": [],
            "COMPLETED": [],
            "CANCELLED": []
        };

        data.data.forEach(plan => {
            if (groups[plan.status]) {
                groups[plan.status].push(plan);
            }
        });

        // For list view, filter out empty
        if (view === 'list') {
            const filteredGroups: Record<string, Plan[]> = {};
            Object.keys(groups).forEach(key => {
                const statusKey = key as PlanStatus;
                if (groups[statusKey].length > 0) {
                    filteredGroups[statusKey] = groups[statusKey];
                }
            });
            return filteredGroups;
        }

        return groups;
    }, [data, view]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={18} className="text-default-400" />;
            case 'IN_PROGRESS': return <Flame size={18} className="text-primary" />;
            case 'COMPLETED': return <CheckCircle size={18} className="text-success" />;
            case 'CANCELLED': return <Ban size={18} className="text-danger" />;
            default: return <Eye size={18} className="text-default-400" />;
        }
    };

    const renderBoardView = () => (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
            {(Object.entries(groupedPlans) as [string, Plan[]][]).map(([groupName, plans]) => (
                <div
                    key={groupName}
                    className={`min-w-[300px] w-full bg-default-50 rounded-xl p-3 flex flex-col gap-3 transition-colors duration-200 ${draggedPlan ? 'border-2 border-dashed border-primary-200 hover:bg-primary-50' : 'border-2 border-transparent'}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, groupName as PlanStatus)}
                >
                    <div className="flex items-center gap-2 mb-2 px-1">
                        {getStatusIcon(groupName)}
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

    if (isLoading && !data) {
        return <div className="w-full h-96 flex items-center justify-center"><Spinner size="lg" /></div>;
    }

    return (
        <div className="w-full flex flex-col gap-6">

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
                                    ? Array.from(statusFilter)[0]
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
                            <DropdownItem key="PENDING">Pending</DropdownItem>
                            <DropdownItem key="IN_PROGRESS">In Progress</DropdownItem>
                            <DropdownItem key="COMPLETED">Completed</DropdownItem>
                            <DropdownItem key="CANCELLED">Cancelled</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="flat" startContent={<ArrowUpDown size={18} />}>
                                {sortDescriptor.column === 'lastUpdated' ? 'Date' : 'Name'}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Sort Actions">
                            <DropdownItem key="date_desc" onPress={() => setSortDescriptor({ column: 'lastUpdated', direction: 'descending' })}>Date (Newest)</DropdownItem>
                            <DropdownItem key="date_asc" onPress={() => setSortDescriptor({ column: 'lastUpdated', direction: 'ascending' })}>Date (Oldest)</DropdownItem>
                            <DropdownItem key="name_asc" onPress={() => setSortDescriptor({ column: 'name', direction: 'ascending' })}>Name (A-Z)</DropdownItem>
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
                    {(Object.entries(groupedPlans) as [string, Plan[]][]).map(([groupName, plans]) => (
                        <div key={groupName} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1 pl-1">
                                {getStatusIcon(groupName)}
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
                        <Pagination total={data?.meta.totalPages || 1} initialPage={1} color="primary" />
                    </div>
                </div>
            )}
        </div>
    );
}
