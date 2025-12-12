'use client';

import React from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { User } from '@heroui/user';
import { Divider } from '@heroui/divider';
import { useTranslation } from '@/components/providers/language-provider';
import { Material } from '@/types/materials';
import { ArrowLeft, Box, Package, History, Info, Tag, Layers, Truck, FileText, AlertTriangle, Edit, Trash2, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Image } from '@heroui/image';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { MovementHistoryTable } from '@/components/warehouses/MovementHistoryTable';
import { Spinner } from '@heroui/spinner';

interface MaterialDetailProps {
    material: Material;
}

export default function MaterialDetail({ material }: MaterialDetailProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const statusColorMap: Record<string, "success" | "danger" | "warning" | "default"> = {
        active: "success",
        inactive: "default",
        discontinued: "danger",
    };

    // --- Data Fetching ---

    // 1. Fetch Total Inventory Balance
    const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
        queryKey: ['inventory', 'balance', 'total', material.id],
        queryFn: () => inventoryService.getTotalBalance({ material_id: material.id })
    });

    const totalStock = balanceData?.data?.[0]?.total_quantity || 0;
    const warehouseBreakdown = balanceData?.data?.[0]?.warehouse_breakdown || [];

    // 2. Fetch Movement History
    const [historyPage, setHistoryPage] = React.useState(1);
    const { data: historyData, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['inventory', 'history', material.id, historyPage],
        queryFn: () => inventoryService.getMovementHistory({ material_id: material.id, page: historyPage, limit: 10 })
    });

    // Helper to normalize history data structure (flat vs nested)
    const historyItems = React.useMemo(() => {
        if (!historyData || !historyData.success) return [];
        const raw = historyData as any;
        if (Array.isArray(raw.data)) return raw.data;
        if (raw.data && Array.isArray(raw.data.data)) return raw.data.data;
        return [];
    }, [historyData]);

    const historyTotalPages = React.useMemo(() => {
        if (!historyData || !historyData.success) return 1;
        const raw = historyData as any;
        return raw.meta?.totalPages || raw.data?.meta?.totalPages || 1;
    }, [historyData]);


    const handleEdit = () => {
        router.push(`/super-admin/materials/${material.id}/edit`);
    };

    const handleDelete = () => {
        if (confirm(t('common.confirmDeleteMessage'))) {
            // In a real app, call delete mutation here
            alert("Mock delete action triggered");
            router.push('/super-admin/materials/all');
        }
    };

    // --- Sub-components (Tabs) ---

    const OverviewTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info Card */}
            <div className="col-span-1 md:col-span-2 space-y-6">
                <Card className="shadow-sm border border-default-100">
                    <CardHeader className="pb-0 px-6 pt-6 flex-col items-start gap-2">
                        <h4 className="font-bold text-large uppercase text-default-600 flex items-center gap-2">
                            <Info size={18} />
                            {t('materials.field.description')}
                        </h4>
                    </CardHeader>
                    <CardBody className="py-6 px-6">
                        <p className="text-default-500 whitespace-pre-wrap leading-relaxed">
                            {material.description || t('common.noDescription')}
                        </p>

                        <Divider className="my-6" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <span className="text-small text-default-500 block mb-1">{t('materials.group')}</span>
                                <div className="flex items-center gap-2">
                                    <Layers size={18} className="text-primary" />
                                    <span className="font-medium text-default-900">{material.materialGroup?.name || "-"}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-small text-default-500 block mb-1">{t('materials.container')}</span>
                                <div className="flex items-center gap-2">
                                    <Box size={18} className="text-secondary" />
                                    <span className="font-medium text-default-900">{material.containerType?.name || "-"}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-small text-default-500 block mb-1">{t('materials.field.supplier')}</span>
                                {material.supplier ? (
                                    <User
                                        name={material.supplier.name}
                                        description={material.supplier.email}
                                        avatarProps={{ src: "", size: "sm", name: material.supplier.name.charAt(0) }}
                                    />
                                ) : (
                                    <span className="text-default-400">-</span>
                                )}
                            </div>
                            <div>
                                <span className="text-small text-default-500 block mb-1">{t('materials.field.leadTime')}</span>
                                <div className="flex items-center gap-2">
                                    <Truck size={18} className="text-warning" />
                                    <span className="font-medium text-default-900">{material.orderLeadTime} Days</span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Warehouse Breakdown */}
                {warehouseBreakdown.length > 0 && (
                    <Card className="shadow-sm border border-default-100">
                        <CardHeader className="pb-0 px-6 pt-6">
                            <h4 className="font-bold text-medium text-default-600 flex items-center gap-2">
                                <Building size={18} />
                                Stock by Warehouse
                            </h4>
                        </CardHeader>
                        <CardBody className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                                {warehouseBreakdown.map((wh) => (
                                    <div key={wh.warehouse_id} className="flex justify-between items-center py-2 border-b border-default-100 last:border-0">
                                        <span className="text-default-600">{wh.warehouse_name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{wh.quantity.toLocaleString()}</span>
                                            <span className="text-tiny text-default-400">{material.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* Stats / Side Card */}
            <div className="space-y-4">
                <Card className="shadow-sm border border-default-100 bg-content1">
                    <CardHeader className="flex gap-3 px-6 pt-6">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Package size={24} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-small text-default-500 uppercase font-bold">{t('materials.inventoryLevel')}</p>
                            <span className="text-tiny text-default-400">Total across all warehouses</span>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 pt-2 gap-4">
                        <div className="flex justify-between items-baseline">
                            {isLoadingBalance ? (
                                <Spinner size="sm" />
                            ) : (
                                <span className="text-3xl font-bold">{totalStock.toLocaleString()}</span>
                            )}
                            <span className="text-small font-medium text-default-500">{material.unit}</span>
                        </div>
                        <Divider />
                        <div className="grid grid-cols-2 gap-4 text-small">
                            <div>
                                <span className="text-default-500 block">Min Stock</span>
                                <span className="font-semibold text-danger">{material.minStockLevel}</span>
                            </div>
                            <div>
                                <span className="text-default-500 block">Max Stock</span>
                                <span className="font-semibold text-success">{material.containerMaxStock}</span>
                            </div>
                            <div>
                                <span className="text-default-500 block">Qty / Container</span>
                                <span className="font-semibold">{material.quantity.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-default-500 block uppercase">Valuation</span>
                                {isLoadingBalance ? (
                                    <span className="text-tiny text-default-400">Calcul...</span>
                                ) : (
                                    <span className="font-semibold text-primary">${(material.price * totalStock).toLocaleString()}</span>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {((!isLoadingBalance && totalStock <= material.minStockLevel)) && (
                    <Card className="shadow-sm border border-transparent bg-warning/10">
                        <CardBody className="flex flex-row items-center gap-4 p-4 text-warning-600">
                            <AlertTriangle size={24} />
                            <div className="flex flex-col">
                                <span className="font-bold">Low Stock Warning</span>
                                <span className="text-xs">Current stock is at or below minimum level.</span>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="flat" onPress={() => router.back()} className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="relative">
                        <Image
                            alt={material.name}
                            className="object-cover rounded-xl"
                            height={64}
                            src={material.imageUrl || "https://placehold.co/100x100?text=MAT"}
                            width={64}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                {material.name}
                            </h1>
                            <Chip size="sm" variant="dot" color={statusColorMap[material.status] || "default"} className="capitalize border-none">
                                {t(`common.${material.status}`)}
                            </Chip>
                        </div>
                        <div className="flex items-center gap-2 text-default-500">
                            <Tag size={14} />
                            <span className="font-mono text-sm">{material.sku}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" startContent={<Edit size={18} />} onPress={handleEdit}>
                        {t('common.edit')}
                    </Button>
                    <Button variant="ghost" color="danger" startContent={<Trash2 size={18} />} onPress={handleDelete}>
                        {t('common.delete')}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs aria-label="Material Details" color="primary" variant="underlined">
                <Tab key="overview" title={
                    <div className="flex items-center gap-2">
                        <Info size={16} />
                        <span>{t('materials.tab.overview')}</span>
                    </div>
                }>
                    <OverviewTab />
                </Tab>
                <Tab key="history" title={
                    <div className="flex items-center gap-2">
                        <History size={16} />
                        <span>{t('materials.tab.history')}</span>
                    </div>
                }>
                    <Card className="shadow-sm border border-default-100">
                        <CardBody>
                            <MovementHistoryTable
                                items={historyItems}
                                isLoading={isLoadingHistory}
                                page={historyPage}
                                totalPages={historyTotalPages}
                                onPageChange={setHistoryPage}
                            />
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="documents" title={
                    <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span>{t('materials.tab.documents')}</span>
                    </div>
                }>
                    <Card className="shadow-none border border-default-200 p-8 flex flex-col items-center justify-center text-default-400 border-dashed">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p>No documents.</p>
                        <Button size="sm" variant="flat" className="mt-4">Upload Document (Mock)</Button>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}
