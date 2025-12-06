"use client";

import React, { useEffect, useState } from "react";
import { getKeyValue } from "@heroui/table";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Search, Plus, Edit, Trash } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { containerTypeService } from "@/services/material.service";
import { ContainerType, CreateContainerTypeDTO } from "@/types/materials";
import { Spinner } from "@heroui/spinner";
import { ConfirmModal } from "@/components/common/confirm-modal";

export function ContainerTypeManagement() {
    const { t } = useTranslation();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [containers, setContainers] = useState<ContainerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [editingContainer, setEditingContainer] = useState<ContainerType | null>(null);
    const [formData, setFormData] = useState<CreateContainerTypeDTO>({ name: "", description: "" });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await containerTypeService.getAll();
            setContainers(data);
        } catch (error) {
            console.error("Failed to load container types", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingContainer) {
                await containerTypeService.update(editingContainer.id, formData);
            } else {
                await containerTypeService.create(formData);
            }
            loadData();
            onClose();
            setEditingContainer(null);
            setFormData({ name: "", description: "" });
        } catch (error) {
            console.error("Failed to save container type", error);
        }
    };

    const handleEdit = (container: ContainerType) => {
        setEditingContainer(container);
        setFormData({ name: container.name, description: container.description || "" });
        onOpen();
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await containerTypeService.delete(deleteId);
                loadData();
            } catch (error) {
                console.error("Failed to delete container type", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    const handleAdd = () => {
        setEditingContainer(null);
        setFormData({ name: "", description: "" });
        onOpen();
    };

    const filteredItems = React.useMemo(() => {
        return containers.filter((item) =>
            item.name.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [containers, filterValue]);

    const columns = [
        { name: t("containers.name"), uid: "name" },
        { name: t("containers.description"), uid: "description" },
        { name: t("common.actions"), uid: "actions" },
    ];

    return (
        <div className="space-y-4">
            <DataTable
                data={filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
                columns={columns}
                meta={{
                    totalItems: filteredItems.length,
                    itemCount: filteredItems.length,
                    itemsPerPage: rowsPerPage,
                    totalPages: Math.ceil(filteredItems.length / rowsPerPage),
                    currentPage: page,
                }}
                isLoading={loading}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                onSearch={setFilterValue}
                onAddNew={handleAdd}
                renderCell={(item, columnKey) => {
                    switch (columnKey) {
                        case "actions":
                            return (
                                <div className="relative flex items-center gap-2">
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
                            return getKeyValue(item, columnKey as any);
                    }
                }}
            />

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{editingContainer ? t("containers.editContainer") : t("containers.addContainer")}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label={t("containers.name")}
                                    value={formData.name}
                                    onValueChange={(val) => setFormData({ ...formData, name: val })}
                                />
                                <Textarea
                                    label={t("containers.description")}
                                    value={formData.description}
                                    onValueChange={(val) => setFormData({ ...formData, description: val })}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    {t("common.cancel")}
                                </Button>
                                <Button color="primary" onPress={handleSave}>
                                    {t("common.save")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
