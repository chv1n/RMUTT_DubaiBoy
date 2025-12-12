
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, Column } from "@/components/common/data-table";
import { inventoryService } from "@/services/inventory.service";
import { materialService } from "@/services/material.service";
import { warehouseService } from "@/services/warehouse.service";
import { MovementHistoryItem } from "@/types/inventory";
import { Material } from "@/types/materials";
import { Warehouse } from "@/types/warehouse";
import { Meta } from "@/types/api";
import { useTranslation } from "react-i18next";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";

export const InventoryTransactionList = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<(MovementHistoryItem & { id: number })[]>([]);
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [materials, setMaterials] = useState<Material[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

    const fetchFilters = async () => {
        try {
            const [matRes, whRes] = await Promise.all([
                materialService.getAll(1, 100),
                warehouseService.getAll(1, 100)
            ]);
            if (matRes.success) setMaterials(matRes.data);
            if (whRes.success) setWarehouses(whRes.data);
        } catch (error) {
            console.error("Failed to load filters", error);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    const loadData = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const response = await inventoryService.getMovementHistory({
                page,
                limit: 10,
                material_id: selectedMaterialId ? Number(selectedMaterialId) : '',
                warehouse_id: selectedWarehouseId ? Number(selectedWarehouseId) : '',
            });

            if (response.success) {
                // Handle different response types if necessary, assuming standard ApiResponse structure wrapper
                // If response.data is array vs object. Service mock returns object with data property.
                // But typed as MovementHistoryResponse | MovementHistoryItem[]
                // Let's assume the standard structure for now which includes meta sibling to data if unwrapped, or nested.

                // Based on InventoryService mock:
                // returns { success: true, data: [...], meta: ... }
                // So response.data IS the array.

                let items: MovementHistoryItem[] = [];

                if (Array.isArray(response.data)) {
                    items = response.data;
                } else if (response.data && 'data' in response.data) {
                    // If nested structure
                    items = (response.data as any).data;
                } else {
                    items = response.data as any || [];
                }

                setData(items.map(item => ({ ...item, id: item.transaction_id })));

                setMeta(response.meta || { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 });
            }
        } catch (error) {
            console.error("Failed to load history", error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMaterialId, selectedWarehouseId]);

    useEffect(() => {
        loadData(1);
    }, [loadData]);

    const columns: Column[] = [
        { name: t('common.date'), uid: "transaction_date", sortable: true },
        { name: t('inventory.fields.type'), uid: "transaction_type", sortable: true },
        { name: t('warehouses.material'), uid: "material_name", sortable: true },
        { name: t('inventory.fields.warehouse'), uid: "warehouse_name", sortable: true },
        { name: t('inventory.fields.quantity'), uid: "quantity_change", sortable: true },
        { name: t('inventory.fields.reference'), uid: "reference_number" },
        { name: t('inventory.fields.reason'), uid: "reason_remarks" },
    ];

    const renderCell = useCallback((item: MovementHistoryItem & { id: number }, columnKey: React.Key) => {
        switch (columnKey) {
            case "transaction_date":
                return new Date(item.transaction_date).toLocaleString();
            case "transaction_type":
                let color: "success" | "danger" | "warning" | "default" = "default";
                if (item.transaction_type === "IN" || item.transaction_type === "TRANSFER_IN" || item.transaction_type === "ADJUSTMENT_IN") color = "success";
                if (item.transaction_type === "OUT" || item.transaction_type === "TRANSFER_OUT" || item.transaction_type === "ADJUSTMENT_OUT") color = "danger";
                return <Chip color={color} variant="flat" size="sm">{item.transaction_type}</Chip>;
            case "material_name":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{item.material_name}</span>
                        <span className="text-tiny text-default-400">ID: {item.material_id}</span>
                    </div>
                );
            case "warehouse_name":
                return item.warehouse_name;
            case "quantity_change":
                return (
                    <span className={item.quantity_change > 0 ? "text-success font-semibold" : "text-danger font-semibold"}>
                        {item.quantity_change > 0 ? "+" : ""}{item.quantity_change}
                    </span>
                );
            case "reference_number":
                return item.reference_number || "-";
            case "reason_remarks":
                return <span className="text-tiny truncate max-w-[200px] inline-block" title={item.reason_remarks}>{item.reason_remarks || "-"}</span>;
            default:
                return (item as any)[columnKey as string];
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Select
                    label={t('inventory.filterByMaterial')}
                    placeholder={t('inventory.allMaterials')}
                    className="max-w-xs"
                    selectedKeys={selectedMaterialId ? [selectedMaterialId] : []}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                >
                    {materials.map((m) => (
                        <SelectItem key={String(m.id)} textValue={m.name}>
                            {m.name}
                        </SelectItem>
                    ))}
                </Select>
                <Select
                    label={t('inventory.filterByWarehouse')}
                    placeholder={t('inventory.allWarehouses')}
                    className="max-w-xs"
                    selectedKeys={selectedWarehouseId ? [selectedWarehouseId] : []}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                >
                    {warehouses.map((w) => (
                        <SelectItem key={String(w.id)} textValue={w.name}>
                            {w.name}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <DataTable
                data={data}
                columns={columns}
                meta={meta}
                isLoading={isLoading}
                onPageChange={(page) => loadData(page)}
                renderCell={renderCell}
            // Hiding add button or reuse for something else if needed, passing empty usually hides it or does nothing? 
            // Currently DataTable might show Add button if onAddNew is present. 
            // If we don't want an Add button on History page, we might need to modify DataTable or pass undefined/null if supported.
            // Checking DataTable usage: "onAddNew" is optional in some implementations or renders button if present.
            // Use empty function to handle it safely or remove if permissible.
            />
        </div>
    );
};
