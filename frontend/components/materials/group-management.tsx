"use client";

import React, { useEffect, useState } from "react";
import { getKeyValue } from "@heroui/table";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Edit, Trash } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { materialGroupService } from "@/services/material.service";
import { MaterialGroup, CreateMaterialGroupDTO } from "@/types/materials";
import { ConfirmModal } from "@/components/common/confirm-modal";

export function GroupManagement() {
    const { t } = useTranslation();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [groups, setGroups] = useState<MaterialGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [editingGroup, setEditingGroup] = useState<MaterialGroup | null>(null);
    const [formData, setFormData] = useState<CreateMaterialGroupDTO>({ group_name: "", abbreviation: "" });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await materialGroupService.getAll();
            setGroups(data);
        } catch (error) {
            console.error("Failed to load groups", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingGroup) {
                await materialGroupService.update(editingGroup.id, formData);
            } else {
                await materialGroupService.create(formData);
            }
            loadData();
            onClose();
            setEditingGroup(null);
            setFormData({ group_name: "", abbreviation: "" });
        } catch (error) {
            console.error("Failed to save group", error);
        }
    };

    const handleEdit = (group: MaterialGroup) => {
        setEditingGroup(group);
        setFormData({ group_name: group.name, abbreviation: group.abbreviation });
        onOpen();
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await materialGroupService.delete(deleteId);
                loadData();
            } catch (error) {
                console.error("Failed to delete group", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    const handleAdd = () => {
        setEditingGroup(null);
        setFormData({ group_name: "", abbreviation: "" });
        onOpen();
    };

    const filteredItems = React.useMemo(() => {
        return groups.filter((item) =>
            item.name.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [groups, filterValue]);

    const columns = [
        { name: t("groups.name"), uid: "name" },
        { name: t("groups.abbreviation"), uid: "abbreviation" },
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
                                        <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(item as MaterialGroup)}>
                                            <Edit size={20} />
                                        </span>
                                    </Tooltip>
                                    <Tooltip color="danger" content={t("common.delete")}>
                                        <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => confirmDelete((item as MaterialGroup).id)}>
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

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{editingGroup ? t("groups.editGroup") : t("groups.addGroup")}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label={t("groups.name")}
                                    value={formData.group_name}
                                    onValueChange={(val) => setFormData({ ...formData, group_name: val })}
                                />
                                <Input
                                    label={t("groups.abbreviation")}
                                    value={formData.abbreviation}
                                    onValueChange={(val) => setFormData({ ...formData, abbreviation: val })}
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
