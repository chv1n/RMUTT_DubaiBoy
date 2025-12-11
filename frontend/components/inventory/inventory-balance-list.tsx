
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, Column } from "@/components/common/data-table";
import { inventoryService } from "@/services/inventory.service";
import { InventoryBalance } from "@/types/inventory";
import { Meta } from "@/types/api";
import { useTranslation } from "react-i18next";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { ArrowRightLeft, PackagePlus, PackageMinus, Plus, Trash, Edit, RefreshCw } from "lucide-react";
import { InventoryActionModal } from "./inventory-action-modal";
import { InventoryStats } from "./inventory-stats";

export const InventoryBalanceList = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<(InventoryBalance & { id: string })[]>([]);
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<"IN" | "OUT" | "ADJUST" | "TRANSFER">("IN");
    const [selectedItem, setSelectedItem] = useState<{ materialId: number, warehouseId: number } | undefined>(undefined);

    const loadData = useCallback(async (page: number, search: string) => {
        setIsLoading(true);
        try {
            const response = await inventoryService.getBalance({ page, limit: 10, search });
            if (response.success) {
                // Add synthetic ID for DataTable
                const processedData = response.data.map((item, index) => ({
                    ...item,
                    id: `${item.material_id}-${item.warehouse_id}-${item.order_number || index}`
                }));
                setData(processedData);
                if (response.meta) {
                    setMeta(response.meta);
                }
            }
        } catch (error) {
            console.error("Failed to load inventory balance", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(1, "");
    }, [loadData]);

    const columns: Column[] = [
        { name: t('inventory.fields.orderNumber'), uid: "order_number", sortable: true },
        { name: "Material", uid: "material_name", sortable: true }, // Key needs translation if possible, sticking to raw for now
        { name: t('inventory.fields.quantity'), uid: "quantity", sortable: true },
        { name: "Warehouse", uid: "warehouse_name", sortable: true },
        { name: t('inventory.fields.mfgDate'), uid: "mfg_date", sortable: true },
        { name: t('inventory.fields.expDate'), uid: "exp_date", sortable: true },
        { name: t('common.actions'), uid: "actions" },
    ];

    const renderCell = useCallback((item: InventoryBalance & { id: string }, columnKey: React.Key) => {
        switch (columnKey) {
            case "order_number":
                return <span className="font-mono text-small">{item.order_number || "-"}</span>;
            case "material_name":
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold">{item.material_name}</span>
                        <span className="text-tiny text-default-400">ID: {item.material_id}</span>
                    </div>
                );
            case "quantity":
                return (
                    <Chip color={item.quantity > 0 ? "success" : "danger"} variant="flat" size="sm">
                        {item.quantity}
                    </Chip>
                );
            case "warehouse_name":
                return item.warehouse_name;
            case "mfg_date":
                // Format date if needed
                return item.mfg_date ? new Date(item.mfg_date).toLocaleDateString() : "-";
            case "exp_date":
                return item.exp_date ? new Date(item.exp_date).toLocaleDateString() : "-";
            case "actions":
                return (
                    <div className="flex gap-2">
                        <Button
                            isIconOnly size="sm" variant="light" color="primary"
                            title={t('inventory.transfer')}
                            onPress={() => {
                                setSelectedItem({ materialId: item.material_id, warehouseId: item.warehouse_id });
                                setModalAction("TRANSFER");
                                setIsModalOpen(true);
                            }}
                        >
                            <RefreshCw size={16} />
                        </Button>
                        <Button
                            isIconOnly size="sm" variant="light" color="warning"
                            title={t('inventory.adjustment')}
                            onPress={() => {
                                setSelectedItem({ materialId: item.material_id, warehouseId: item.warehouse_id });
                                setModalAction("ADJUST");
                                setIsModalOpen(true);
                            }}
                        >
                            <Edit size={16} />
                        </Button>
                        <Button
                            isIconOnly size="sm" variant="light" color="danger"
                            title={t('inventory.goodsIssue')}
                            onPress={() => {
                                setSelectedItem({ materialId: item.material_id, warehouseId: item.warehouse_id });
                                setModalAction("OUT");
                                setIsModalOpen(true);
                            }}
                        >
                            <PackageMinus size={16} />
                        </Button>
                    </div>
                );
            default:
                return (item as any)[columnKey as string];
        }
    }, [t]);

    return (
        <div className="space-y-6">
            <InventoryStats />
            <DataTable
                data={data}
                columns={columns}
                meta={meta}
                isLoading={isLoading}
                onPageChange={(page) => loadData(page, "")}
                onSearch={(value) => loadData(1, value)}
                renderCell={renderCell}
                onAddNew={() => {
                    setSelectedItem(undefined);
                    setModalAction("IN");
                    setIsModalOpen(true);
                }}
            />
            <InventoryActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => loadData(1, "")}
                defaultAction={modalAction}
                defaultMaterialId={selectedItem?.materialId}
                defaultWarehouseId={selectedItem?.warehouseId}
            />
        </div>
    );
};
