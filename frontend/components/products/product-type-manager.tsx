"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/components/providers/language-provider";
import { ProductType, CreateProductTypeDTO, UpdateProductTypeDTO } from "@/types/product";
import { productTypeService } from "@/services/product.service";
import { addToast } from "@heroui/toast";
import { DataTable, Column } from "@/components/common/data-table";
import { Meta } from "@/types/api";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Edit, Trash } from "lucide-react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { ConfirmModal } from "@/components/common/confirm-modal";

export function ProductTypeManager() {
    const { t } = useTranslation();
    // Modal state for Form
    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    // Modal state for Delete Confirm
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const [types, setTypes] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(false);

    // Pagination & Filter state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [meta, setMeta] = useState<Meta>({
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1
    });

    // Edit/Create state
    const [editingType, setEditingType] = useState<ProductType | null>(null);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Delete state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productTypeService.getAll(page, rowsPerPage, search, statusFilter);
            console.log(response.data);
            setTypes(response.data);
            // setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load materials", error);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, search, status]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = () => {
        setEditingType(null);
        setName("");
        setIsActive(true);
        onFormOpen();
    };

    const handleEdit = (type: ProductType) => {
        setEditingType(type);
        setName(type.name);
        setIsActive(type.isActive);
        onFormOpen();
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        onDeleteOpen();
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await productTypeService.delete(deleteId);
            addToast({ title: t("common.success"), color: "success" });
            loadData();
            onDeleteClose();
        } catch (e) {
            console.error(e);
            addToast({ title: t("common.error"), color: "danger" });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingType) {
                const updateDto: UpdateProductTypeDTO = { name, isActive };
                await productTypeService.update(editingType.id, updateDto);
                addToast({ title: t("common.success"), color: "success" });
            } else {
                const createDto: CreateProductTypeDTO = { name };
                await productTypeService.create(createDto);
                addToast({ title: t("common.success"), color: "success" });
            }
            onFormClose();
            loadData();
        } catch (e) {
            console.error(e);
            addToast({ title: t("common.error"), color: "danger" });
        }
    };

    const columns: Column[] = [
        { name: "ID", uid: "id", sortable: true },
        { name: t("products.category"), uid: "name", sortable: true },
        { name: t("common.status"), uid: "isActive" },
        { name: t("common.actions"), uid: "actions", align: "center" },
    ];

    const renderCell = useCallback((item: ProductType, columnKey: React.Key) => {
        switch (columnKey) {
            case "id":
                return <span>{item.id}</span>;
            case "name":
                return <span className="font-medium">{item.name}</span>;
            case "isActive":
                return (
                    <Chip className="capitalize" color={item.isActive ? "success" : "default"} size="sm" variant="flat">
                        {item.isActive ? t("common.active") : t("common.inactive")}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("common.edit")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <Edit size={20} onClick={() => handleEdit(item)} />
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
                return (item as any)[String(columnKey)];
        }
    }, [t]);

    return (
        <>
            <DataTable
                data={types}
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
                    setStatusFilter(val);
                    setPage(1);
                }}
                onAddNew={handleCreate}
                renderCell={renderCell}
                statusOptions={[
                    { name: t("common.active"), uid: "active" },
                    { name: t("common.inactive"), uid: "inactive" }
                ]}
            />

            <Modal isOpen={isFormOpen} onClose={onFormClose} placement="center">
                <ModalContent>
                    {(onFormClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {editingType ? t("products.editProductType") : t("products.addProductType")}
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label={t("products.category")}
                                    placeholder="Enter type name"
                                    value={name}
                                    onValueChange={setName}
                                    isRequired
                                />
                                {
                                    editingType && (
                                        <div className="flex items-center gap-2">
                                            <Switch isSelected={isActive} onValueChange={setIsActive} />
                                            <span>{isActive ? t("common.active") : t("common.inactive")}</span>
                                        </div>
                                    )
                                }

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onFormClose}>
                                    {t("common.cancel")}
                                </Button>
                                <Button color="primary" onPress={handleSubmit}>
                                    {t("common.save")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                title={t("common.confirmDelete")}
                message={t("common.confirmDeleteMessage")}
            />
        </>
    );
}
