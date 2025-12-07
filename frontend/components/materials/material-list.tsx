"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Edit, Trash, Eye } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { materialService } from "@/services/material.service";
import { Material } from "@/types/materials";
import { Meta } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { exportToCSV, exportToExcel } from "@/lib/utils/export";
import { DataTable, Column } from "@/components/common/data-table";

export function MaterialList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1
    });

    // Filter states
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await materialService.getAll(page, rowsPerPage, search, status);
            setMaterials(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load materials", error);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, search, status]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await materialService.delete(deleteId);
                loadData();
            } catch (error) {
                console.error("Failed to delete material", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    const handleExportExcel = () => {
        const dataToExport = materials.map(item => ({
            ID: item.id,
            Name: item.name,
            SKU: item.sku,
            Group: item.materialGroup?.name,
            Price: item.price,
            Quantity: item.quantity,
            Unit: item.unit,
            Status: item.status
        }));
        exportToExcel(dataToExport, "Materials");
    };

    const handleExportCSV = () => {
        const dataToExport = materials.map(item => ({
            ID: item.id,
            Name: item.name,
            SKU: item.sku,
            Group: item.materialGroup?.name,
            Price: item.price,
            Quantity: item.quantity,
            Unit: item.unit,
            Status: item.status
        }));
        exportToCSV(dataToExport, "Materials");
    };

    const columns: Column[] = [
        { name: t("materials.name"), uid: "name", sortable: true },
        { name: t("materials.sku"), uid: "sku" },
        { name: t("materials.group"), uid: "group" },
        { name: t("materials.price"), uid: "price", sortable: true },
        { name: t("materials.quantity"), uid: "quantity", sortable: true },
        { name: t("common.status"), uid: "status" },
        { name: t("common.actions"), uid: "actions", align: "center" },
    ];

    const renderCell = useCallback((item: Material, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof Material];

        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{item.name}</p>
                        <p className="text-bold text-tiny capitalize text-default-400">{item.description}</p>
                    </div>
                );
            case "group":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{item.materialGroup?.name}</p>
                    </div>
                );
            case "price":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">${item.price}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip className="capitalize" color={item.status === "active" ? "success" : "danger"} size="sm" variant="flat">
                        {t(`common.${item.status}`)}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("materials.detail")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/materials/${item.id}`}>
                                    <Eye size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip content={t("common.edit")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/materials/${item.id}/edit`}>
                                    <Edit size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content={t("common.delete")}>
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => confirmDelete(item.id)}>
                                <Trash size={20} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue as React.ReactNode;
        }
    }, [t]);

    return (
        <div className="space-y-4">
            <DataTable
                data={materials}
                columns={columns}
                meta={meta}
                isLoading={loading}
                onPageChange={setPage}
                onRowsPerPageChange={(rows) => {
                    setRowsPerPage(rows);
                    setPage(1); // Reset to first page
                }}
                onSearch={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                onFilterStatus={(val) => {
                    setStatus(val);
                    setPage(1);
                }}
                onExportExcel={handleExportExcel}
                onExportCSV={handleExportCSV}
                onAddNew={() => router.push("/super-admin/materials/new")}
                renderCell={renderCell}
                statusOptions={[
                    { name: t("common.active"), uid: "true" },
                    { name: t("common.inactive"), uid: "false" }
                ]}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
