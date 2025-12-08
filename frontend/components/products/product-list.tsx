"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Edit, Eye, Box, Trash, RefreshCw } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { Meta } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { exportToCSV, exportToExcel } from "@/lib/utils/export";
import { DataTable, Column } from "@/components/common/data-table";
import { Selection } from "@heroui/table";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useDisclosure } from "@heroui/modal";
import { ConfirmModal } from "@/components/common/confirm-modal";

export function ProductList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

    // Confirm Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [deleteId, setDeleteId] = useState<number | string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts(page, rowsPerPage, search, status);
            setProducts(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load products", error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, search, status, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getSelectedItems = useCallback(() => {
        if (selectedKeys === "all") return products;
        const selectedSet = new Set(selectedKeys);
        return products.filter(p => selectedSet.has(p.id));
    }, [selectedKeys, products]);

    const handleExportExcel = () => {
        const items = getSelectedItems().length > 0 ? getSelectedItems() : products;
        const dataToExport = items.map(item => ({
            Code: item.sku,
            Name: item.name,
            Category: item.category,
            Status: item.status,
            Price: item.price,
            Unit: item.unit,
            LastUpdated: item.lastUpdated
        }));
        exportToExcel(dataToExport, "Products");
    };

    const handleExportCSV = () => {
        const items = getSelectedItems().length > 0 ? getSelectedItems() : products;
        const dataToExport = items.map(item => ({
            Code: item.sku,
            Name: item.name,
            Category: item.category,
            Status: item.status,
            LastUpdated: item.lastUpdated
        }));
        exportToCSV(dataToExport, "Products");
    };

    const handleDeleteClick = (id: number | string) => {
        setDeleteId(id);
        onOpen();
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await productService.deleteProduct(deleteId);
            addToast({ title: t("common.success"), color: "success" });
            loadData();
            onClose();
        } catch (error) {
            console.error(error);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleBulkApprove = async () => {
        try {
            const keys = Array.from(selectedKeys);
            let ids: (number | string)[] = [];
            if (selectedKeys === "all") {
                ids = products.map(p => p.id);
            } else {
                ids = keys.map(k => Number(k));
            }

            await productService.bulkApprove(ids);
            addToast({ title: t("common.success"), color: "success" });
            loadData();
            setSelectedKeys(new Set([]));
        } catch (error) {
            addToast({ title: t("common.error"), color: "danger" });
        }
    };

    const handleBulkArchive = async () => {
        try {
            const keys = Array.from(selectedKeys);
            let ids: (number | string)[] = [];
            if (selectedKeys === "all") {
                ids = products.map(p => p.id);
            } else {
                ids = keys.map(k => Number(k));
            }

            await productService.bulkArchive(ids);
            addToast({ title: t("common.success"), color: "success" });
            loadData();
            setSelectedKeys(new Set([]));
        } catch (error) {
            addToast({ title: t("common.error"), color: "danger" });
        }
    };

    const columns: Column[] = [
        { name: t("products.code"), uid: "sku" },
        { name: t("products.name"), uid: "name", sortable: true },
        { name: t("products.category"), uid: "category" },
        { name: t("products.status"), uid: "status" },
        { name: t("products.lastUpdated"), uid: "lastUpdated" },
        { name: t("products.actions"), uid: "actions", align: "center" },
    ];

    const renderCell = useCallback((item: Product, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof Product];

        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{item.name}</p>
                        <p className="text-tiny text-default-400">{item.description || ''}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip className="capitalize" color={item.status === "active" ? "success" : "default"} size="sm" variant="flat">
                        {item.status}
                    </Chip>
                );
            case "lastUpdated":
                return (
                    <span className="text-small text-default-500">{new Date(item.updateDate).toLocaleDateString()}</span>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("products.view")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/products/${item.id}`}>
                                    <Eye size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip content={t("products.bom")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/products/${item.id}?tab=bom`}>
                                    <Box size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip content={t("products.editProduct")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Link href={`/super-admin/products/${item.id}?mode=edit`}>
                                    <Edit size={20} />
                                </Link>
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content={t("common.delete")}>
                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                <Trash size={20} onClick={() => handleDeleteClick(item.id)} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue as React.ReactNode;
        }
    }, [t, onClose]); // Added onClose to deps if needed, though mostly stable

    return (
        <div className="space-y-4">
            <DataTable
                data={products}
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
                onAddNew={() => router.push("/super-admin/products/new")}
                renderCell={renderCell}
                onSelectionChange={setSelectedKeys}
                statusOptions={[
                    { name: t("common.active"), uid: "active" },
                    { name: t("common.inactive"), uid: "inactive" }
                ]}
            />
            {getSelectedItems().length > 0 && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-content1 px-6 py-3 rounded-full shadow-lg border border-default-200 flex items-center gap-4 z-50">
                    <span className="font-semibold">{getSelectedItems().length} selected</span>
                    <div className="h-4 w-[1px] bg-default-300"></div>
                    <Button size="sm" color="success" variant="flat" onPress={handleBulkApprove}>
                        {t("products.approve")}
                    </Button>
                    <Button size="sm" color="warning" variant="flat" onPress={handleBulkArchive}>
                        {t("common.inactive")}
                    </Button>
                </div>
            )}

            <ConfirmModal
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                title={t("common.confirmDelete")}
                message={t("common.confirmDeleteMessage")}
            />
        </div>
    );
}
