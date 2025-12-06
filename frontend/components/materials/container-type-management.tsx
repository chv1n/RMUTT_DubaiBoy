"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Search, Plus, Edit, Trash } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { containerTypeService } from "@/services/material.service";
import { ContainerType, CreateContainerTypeDTO } from "@/types/materials";
import { Spinner } from "@heroui/spinner";
import { getKeyValue } from "@heroui/table";

export function ContainerTypeManagement() {
    const { t } = useTranslation();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [containers, setContainers] = useState<ContainerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [editingContainer, setEditingContainer] = useState<ContainerType | null>(null);
    const [formData, setFormData] = useState<CreateContainerTypeDTO>({ name: "", description: "" });

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
        setFormData({ name: container.name, description: container.description });
        onOpen();
    };

    const handleDelete = async (id: number) => {
        if (confirm(t("common.confirmDelete"))) {
            try {
                await containerTypeService.delete(id);
                loadData();
            } catch (error) {
                console.error("Failed to delete container type", error);
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
            <div className="flex justify-between items-center">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder={t("common.search")}
                    startContent={<Search className="text-default-300" />}
                    value={filterValue}
                    onClear={() => setFilterValue("")}
                    onValueChange={setFilterValue}
                />
                <Button color="primary" endContent={<Plus />} onPress={handleAdd}>
                    {t("containers.addContainer")}
                </Button>
            </div>
            <Table aria-label="Container Type List">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={filteredItems} emptyContent={"No container types found"} isLoading={loading} loadingContent={<Spinner />}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {columnKey === "actions" ? (
                                        <div className="relative flex items-center gap-2">
                                            <Tooltip content={t("common.edit")}>
                                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(item)}>
                                                    <Edit size={20} />
                                                </span>
                                            </Tooltip>
                                            <Tooltip color="danger" content={t("common.delete")}>
                                                <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(item.id)}>
                                                    <Trash size={20} />
                                                </span>
                                            </Tooltip>
                                        </div>
                                    ) : (
                                        getKeyValue(item, columnKey)
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

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
        </div>
    );
}
