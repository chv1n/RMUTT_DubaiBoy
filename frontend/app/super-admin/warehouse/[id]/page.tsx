'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody } from '@heroui/card';
import { warehouseService } from '@/services/warehouse.service';
import { Warehouse, StockLocationItem, MovementHistoryResult } from '@/types/warehouse';
import { WarehouseHeading } from '@/components/warehouse-detail/WarehouseHeading';
import { WarehouseInfo } from '@/components/warehouse-detail/WarehouseInfo';
import { StockLocationTable } from '@/components/warehouse-detail/StockLocationTable';
import { MovementHistoryTable } from '@/components/warehouse-detail/MovementHistoryTable';
import { Spinner } from '@heroui/spinner';
import { useTranslation } from 'react-i18next';

export default function WarehouseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const id = Number(params.id);

    // Data States
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
    const [stockItems, setStockItems] = useState<StockLocationItem[]>([]);
    const [stockTotalPages, setStockTotalPages] = useState(1);
    const [historyItems, setHistoryItems] = useState<MovementHistoryResult['data']>([]);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);

    // Loading States
    const [isLoadingWarehouse, setIsLoadingWarehouse] = useState(true);
    const [isLoadingStock, setIsLoadingStock] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Pagination States
    const [stockPage, setStockPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);

    const fetchWarehouse = useCallback(async () => {
        try {
            setIsLoadingWarehouse(true);
            const data = await warehouseService.getById(id);
            setWarehouse(data);
        } catch (error) {
            console.error("Failed to fetch warehouse", error);
        } finally {
            setIsLoadingWarehouse(false);
        }
    }, [id]);

    const fetchStock = useCallback(async () => {
        try {
            setIsLoadingStock(true);
            const res = await warehouseService.getStockLocation(id, "", stockPage, 10);
            if (res.success && res.data) {
                setStockItems(res.data.materials);
                setStockTotalPages(Math.ceil(res.data.total_items / 10));
            }
        } catch (error) {
            console.error("Failed to fetch stock", error);
        } finally {
            setIsLoadingStock(false);
        }
    }, [id, stockPage]);

    const fetchHistory = useCallback(async () => {
        try {
            setIsLoadingHistory(true);
            const res = await warehouseService.getMovementHistory(id, historyPage, 10);
            if (res.success && res.data) {
                setHistoryItems(res.data.data);
                setHistoryTotalPages(res.data.meta.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [id, historyPage]);

    // Initial Fetch
    useEffect(() => {
        if (id) {
            fetchWarehouse();
        }
    }, [fetchWarehouse, id]);

    // Fetch Tab Data on Change/Mount
    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);


    const handleDelete = async () => {
        if (confirm(t('common.confirmDeleteMessage'))) {
            await warehouseService.delete(id);
            router.push('/super-admin/warehouse');
        }
    };

    const handleEdit = () => {
        // Open modal or navigate to edit page
        console.log("Edit clicked");
    };

    if (isLoadingWarehouse || !warehouse) {
        return <div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" label={t('common.loading')} /></div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <WarehouseHeading
                warehouse={warehouse}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

            <div className="flex w-full flex-col">
                <Tabs aria-label="Warehouse Options" color="primary" variant="underlined">
                    <Tab key="info" title={t('warehouses.overview')}>
                        <Card className="mt-4">
                            <CardBody>
                                <WarehouseInfo warehouse={warehouse} />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="inventory" title={t('warehouses.inventory')}>
                        <Card className="mt-4">
                            <CardBody>
                                <StockLocationTable
                                    items={stockItems}
                                    isLoading={isLoadingStock}
                                    page={stockPage}
                                    totalPages={stockTotalPages}
                                    onPageChange={setStockPage}
                                />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="history" title={t('warehouses.transactions')}>
                        <Card className="mt-4">
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
                </Tabs>
            </div>
        </div>
    );
}
