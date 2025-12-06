"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { User } from "@heroui/user";
import { Edit, Trash, Eye } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import { Supplier } from "@/types/suppliers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { exportToCSV, exportToExcel } from "@/lib/utils/export";
import { DataTable, Column } from "@/components/common/data-table";
import { Meta } from "@/types/api";

// Note: SupplierService needs to be updated to support pagination to fully utilize the DataTable features.
// For now, we will wrap the existing getAll in a simulated paginated response or update the service.
// To keep it consistent, I'll update the component to handle client-side pagination if the service doesn't support it yet,
// OR ideally, update the service. Given the instructions "apply to other pages", I should update the service or simulate it here.
// I'll simulate it here for now to avoid touching too many files unless requested, but the prompt implies "apply to other pages".
// Actually, the prompt says "apply to other pages... SOLID... best practices". Best practice is server-side pagination.
// But I haven't updated SupplierService yet. I will implement client-side pagination using the DataTable for now, 
// as updating SupplierService mock data was not explicitly the main task (Material was).
// However, to make it work seamlessly, I'll adapt the data to the Meta structure.

export function SupplierList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // Store all for client-side pagination
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supplierService.getAll();
            setAllSuppliers(data);
        } catch (error) {
            console.error("Failed to load suppliers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Client-side pagination and filtering effect
    useEffect(() => {
        let filtered = [...allSuppliers];

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(lowerSearch) ||
                s.email.toLowerCase().includes(lowerSearch)
            );
        }

        if (status !== "all") {
            filtered = filtered.filter(s => s.status === status);
        }

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / rowsPerPage);
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = filtered.slice(start, end);

        setSuppliers(paginatedData);
        setMeta({
            totalItems,
            itemCount: paginatedData.length,
            itemsPerPage: rowsPerPage,
            totalPages,
            currentPage: page
        });

    }, [allSuppliers, search, status, page, rowsPerPage]);

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await supplierService.delete(deleteId);
                loadData();
            } catch (error) {
                console.error("Failed to delete supplier", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    const handleExportExcel = () => {
        const dataToExport = suppliers.map(item => ({
            ID: item.id,
            Name: item.name,
            Contact: item.contactPerson,
            Email: item.email,
            Phone: item.phone,
            Category: item.category,
            Rating: item.rating,
            Status: item.status,
            TotalSpent: item.totalSpent
        }));
        exportToExcel(dataToExport, "Suppliers");
    };

    const handleExportCSV = () => {
        const dataToExport = suppliers.map(item => ({
            ID: item.id,
            Name: item.name,
            Contact: item.contactPerson,
            Email: item.email,
            Phone: item.phone,
            Category: item.category,
            Rating: item.rating,
            Status: item.status,
            TotalSpent: item.totalSpent
        }));
        exportToCSV(dataToExport, "Suppliers");
    };

    const columns: Column[] = [
        { name: t("suppliers.name"), uid: "name", sortable: true },
        { name: t("suppliers.category"), uid: "category" },
        { name: t("suppliers.rating"), uid: "rating", sortable: true },
        { name: t("suppliers.totalSpent"), uid: "totalSpent", sortable: true },
        { name: t("suppliers.status"), uid: "status" },
        { name: t("common.actions"), uid: "actions", align: "center" },
    ];

    const renderCell = useCallback((item: Supplier, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof Supplier];

        switch (columnKey) {
            case "name":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: item.logoUrl }}
                        description={item.email}
                        name={item.name}
                    >
                        {item.email}
                    </User>
                );
            case "rating":
                return (
                    <div className="flex items-center gap-1">
                        <span className="text-warning">★</span>
                        <span>{item.rating}</span>
                    </div>
                );
            case "totalSpent":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">${item.totalSpent.toLocaleString()}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip className="capitalize" color={item.status === "active" ? "success" : "danger"} size="sm" variant="flat">
                        {t(`suppliers.${item.status}`)}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("suppliers.detail")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/suppliers/${item.id}`}>
                                    <Eye size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip content={t("common.edit")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/suppliers/${item.id}/edit`}>
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
                data={suppliers}
                columns={columns}
                meta={meta}
                isLoading={loading}
                onPageChange={setPage}
                onRowsPerPageChange={(rows) => {
                    setRowsPerPage(rows);
                    setPage(1);
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
                onAddNew={() => router.push("/super-admin/suppliers/new")}
                renderCell={renderCell}
                statusOptions={[
                    { name: t("suppliers.active"), uid: "active" },
                    { name: t("suppliers.inactive"), uid: "inactive" },
                    { name: t("suppliers.blacklisted"), uid: "blacklisted" }
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
