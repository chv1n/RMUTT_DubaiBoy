"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "@/components/providers/language-provider";
import { materialUnitService } from "@/services/material.service";
import { MaterialUnit } from "@/types/materials";
import { Meta } from "@/types/api";
import { DataTable, Column } from "@/components/common/data-table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Edit, Trash } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";
import { ConfirmModal } from "@/components/common/confirm-modal";

export function UnitManagement() {
    const { t } = useTranslation();
    const [units, setUnits] = useState<MaterialUnit[]>([]);
    const [loading, setLoading] = useState(true);

    // Client-side pagination & filtering state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");

    // Modal state
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [editingUnit, setEditingUnit] = useState<MaterialUnit | null>(null);
    const [formData, setFormData] = useState({ unit_name: "" });
    const [modalLoading, setModalLoading] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await materialUnitService.getAll();
            setUnits(data);
        } catch (error) {
            console.error("Failed to load units", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter and Pagination Logic
    const filteredData = useMemo(() => {
        let filtered = [...units];
        if (search) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        return filtered;
    }, [units, search]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

    const meta: Meta = useMemo(() => {
        return {
            totalItems: filteredData.length,
            itemCount: paginatedData.length,
            itemsPerPage: rowsPerPage,
            totalPages: Math.ceil(filteredData.length / rowsPerPage),
            currentPage: page
        };
    }, [filteredData.length, paginatedData.length, rowsPerPage, page]);

    // Handlers
    const handleAddNew = () => {
        setEditingUnit(null);
        setFormData({ unit_name: "" });
        onOpen();
    };

    const handleEdit = (unit: MaterialUnit) => {
        setEditingUnit(unit);
        setFormData({ unit_name: unit.name });
        onOpen();
    };

    const handleSubmit = async () => {
        setModalLoading(true);
        try {
            if (editingUnit) {
                await materialUnitService.update(editingUnit.id, { unit_name: formData.unit_name });
            } else {
                await materialUnitService.create({ unit_name: formData.unit_name });
            }
            await loadData();
            onClose();
        } catch (error) {
            console.error("Failed to save unit", error);
        } finally {
            setModalLoading(false);
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await materialUnitService.delete(deleteId);
                await loadData();
            } catch (error) {
                console.error("Failed to delete unit", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    // Table Config
    const columns: Column[] = [
        { name: "ID", uid: "id", sortable: true },
        { name: t("materials.unit"), uid: "name", sortable: true },
        { name: t("common.actions"), uid: "actions", align: "center" },
    ];

    const renderCell = (item: MaterialUnit, columnKey: React.Key) => {
        switch (columnKey) {
            case "id":
                return item.id;
            case "name":
                return item.name;
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
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
    };

    // No need to map id separately as it exists on MaterialUnit now
    const tableData = paginatedData;

    return (
        <div className="space-y-4">
            <DataTable
                data={tableData}
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
                onAddNew={handleAddNew}
                renderCell={renderCell}
                onFilterStatus={undefined}
            />

            {/* Edit/Create Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {editingUnit ? t("units.editUnit") : t("units.addUnit")}
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    autoFocus
                                    label={t("materials.unit")}
                                    placeholder={t("materials.unit")}
                                    variant="bordered"
                                    value={formData.unit_name}
                                    onValueChange={(val) => setFormData({ unit_name: val })}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    {t("common.cancel")}
                                </Button>
                                <Button color="primary" onPress={handleSubmit} isLoading={modalLoading}>
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
                title={t("common.confirmDelete")}
                message={t("common.confirmDeleteMessage")}
            />
        </div>
    );
}
