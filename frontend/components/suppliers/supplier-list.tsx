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
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { SupplierForm } from './supplier-form';

export function SupplierList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1
    });

    // Modal state
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

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
                (s.name ?? "").toLowerCase().includes(lowerSearch) ||
                (s.email ?? "").toLowerCase().includes(lowerSearch)
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

    const handleAddNew = () => {
        setSelectedSupplier(undefined);
        setModalMode('create');
        onOpen();
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setModalMode('edit');
        onOpen();
    };

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
            Email: item.email,
            Phone: item.phone,
            Status: item.status,
        }));
        exportToExcel(dataToExport, "Suppliers");
    };

    const handleExportCSV = () => {
        const dataToExport = suppliers.map(item => ({
            ID: item.id,
            Name: item.name,
            Email: item.email,
            Phone: item.phone,
            Status: item.status,
        }));
        exportToCSV(dataToExport, "Suppliers");
    };

    const columns: Column[] = [
        { name: t("suppliers.name"), uid: "name", sortable: true },
        { name: t("suppliers.email"), uid: "email" },
        { name: t("suppliers.phone"), uid: "phone" },
        { name: t("suppliers.status"), uid: "status" },
        { name: t("common.actions"), uid: "actions", align: "center" },
    ];

    const renderCell = useCallback((item: Supplier, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof Supplier];

        switch (columnKey) {
            case "name":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: "" }}
                        description={item.email}
                        name={item.name}
                    >
                        {item.email}
                    </User>
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
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(item)}>
                                <Edit size={20} />
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
                onAddNew={handleAddNew}
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

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" placement="center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {modalMode === 'create' ? t('suppliers.addNew') : t('suppliers.edit')}
                            </ModalHeader>
                            <ModalBody>
                                <SupplierForm
                                    mode={modalMode}
                                    initialData={selectedSupplier}
                                    onSuccess={() => {
                                        onClose();
                                        loadData();
                                    }}
                                    onCancel={onClose}
                                />
                            </ModalBody>
                            <ModalFooter />
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
