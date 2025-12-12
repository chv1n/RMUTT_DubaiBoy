"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { Meta } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { DataTable, Column } from "@/components/common/data-table";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { ProductForm } from "./product-form";

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

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");

    // Load Data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productService.getAll(page, rowsPerPage, search, status);
            setProducts(response.data);
            if (response.meta) {
                setMeta(response.meta);
            }
        } catch (error) {
            console.error("Failed to load products", error);
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
                await productService.delete(deleteId);
                loadData();
            } catch (error) {
                console.error("Failed to delete product", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setFormMode("create");
        setIsFormModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setFormMode("edit");
        setIsFormModalOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        loadData();
    };

    const handleFormClose = () => {
        setIsFormModalOpen(false);
        setSelectedProduct(null);
    };

    const columns: Column[] = [
        { name: t("products.code"), uid: "id" },
        { name: t("products.name"), uid: "name", sortable: true },
        { name: t("products.type"), uid: "typeName" },
        { name: t("products.fields.active"), uid: "isActive", align: "center" },
        { name: t("common.actions"), uid: "actions", align: "center" }
    ];

    const renderCell = useCallback((item: Product, columnKey: React.Key) => {
        switch (columnKey) {
            case "id":
                return <span className="text-default-400">#{item.id}</span>;
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">{item.name}</p>
                    </div>
                );
            case "typeName":
                return (
                    <Chip size="sm" variant="flat" color="primary">{item.typeName}</Chip>
                );
            case "isActive":
                return (
                    <Chip className="capitalize" color={item.isActive ? "success" : "default"} size="sm" variant="dot">
                        {item.isActive ? t("common.active") : t("common.inactive")}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("common.detail")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => router.push(`/super-admin/products/${item.id}`)}>
                                <Eye size={20} />
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
                return (item as any)[columnKey as string];
        }
    }, [router, t]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t("products.title")}</h2>
            </div>

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
                statusOptions={[
                    { name: t("common.active"), uid: "active" },
                    { name: t("common.inactive"), uid: "inactive" }
                ]}
                onAddNew={handleCreate}
                renderCell={renderCell}
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={t("common.confirmDelete")}
                message={t("common.confirmDeleteMessage")}
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={handleFormClose}
                size="4xl"
                placement="center"
                scrollBehavior="inside"
                classNames={{
                    body: "p-6",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {formMode === "create" ? t("products.addProduct") : t("products.editProduct")}
                            </ModalHeader>
                            <ModalBody>
                                <ProductForm
                                    initialData={selectedProduct}
                                    mode={formMode}
                                    onSuccess={handleFormSuccess}
                                    onCancel={handleFormClose}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
