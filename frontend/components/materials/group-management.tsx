"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@heroui/table";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Search, Plus, Edit, Trash } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { materialGroupService } from "@/services/material.service";
import { MaterialGroup, CreateMaterialGroupDTO } from "@/types/materials";
import { Spinner } from "@heroui/spinner";

export function GroupManagement() {
    const { t } = useTranslation();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [groups, setGroups] = useState<MaterialGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [editingGroup, setEditingGroup] = useState<MaterialGroup | null>(null);
    const [formData, setFormData] = useState<CreateMaterialGroupDTO>({ name: "", description: "" });

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
            setFormData({ name: "", description: "" });
        } catch (error) {
            console.error("Failed to save group", error);
        }
    };

    const handleEdit = (group: MaterialGroup) => {
        setEditingGroup(group);
        setFormData({ name: group.name, description: group.description });
        onOpen();
    };

    const handleDelete = async (id: number) => {
        if (confirm(t("common.confirmDelete"))) {
            try {
                await materialGroupService.delete(id);
                loadData();
            } catch (error) {
                console.error("Failed to delete group", error);
            }
        }
    };

    const handleAdd = () => {
        setEditingGroup(null);
        setFormData({ name: "", description: "" });
        onOpen();
    };

    const filteredItems = React.useMemo(() => {
        return groups.filter((item) =>
            item.name.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [groups, filterValue]);

    const columns = [
        { name: t("groups.name"), uid: "name" },
        { name: t("groups.description"), uid: "description" },
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
                    {t("groups.addGroup")}
                </Button>
            </div>
            <Table aria-label="Group List">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={filteredItems} emptyContent={"No groups found"} isLoading={loading} loadingContent={<Spinner />}>
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
                            <ModalHeader className="flex flex-col gap-1">{editingGroup ? t("groups.editGroup") : t("groups.addGroup")}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label={t("groups.name")}
                                    value={formData.name}
                                    onValueChange={(val) => setFormData({ ...formData, name: val })}
                                />
                                <Textarea
                                    label={t("groups.description")}
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
