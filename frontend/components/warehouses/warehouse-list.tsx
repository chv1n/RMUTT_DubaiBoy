"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Edit, Trash, Plus, MapPin, Phone, Mail, Archive, Eye } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { warehouseService } from "@/services/warehouse.service";
import { Warehouse } from "@/types/warehouse";
import { Meta } from "@/types/api";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { DataTable, Column } from "@/components/common/data-table";
import { useDisclosure } from "@heroui/modal";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { useRouter } from "next/navigation";

export function WarehouseList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
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

    // Create/Edit Modal State
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [editingItem, setEditingItem] = useState<Warehouse | null>(null);
    const [formData, setFormData] = useState({
        warehouse_name: "",
        warehouse_code: "",
        warehouse_phone: "",
        warehouse_email: "",
        warehouse_address: "",
        is_active: true
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await warehouseService.getAll(page, rowsPerPage, search, status);
            setWarehouses(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load warehouses", error);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, search, status]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = () => {
        setEditingItem(null);
        setFormData({
            warehouse_name: "",
            warehouse_code: "",
            warehouse_phone: "",
            warehouse_email: "",
            warehouse_address: "",
            is_active: true
        });
        onOpen();
    };

    const handleEdit = (item: Warehouse) => {
        setEditingItem(item);
        setFormData({
            warehouse_name: item.name,
            warehouse_code: item.code,
            warehouse_phone: item.phone || "",
            warehouse_email: item.email || "",
            warehouse_address: item.address || "",
            is_active: item.isActive
        });
        onOpen();
    };

    const handleSubmit = async () => {
        try {
            if (editingItem) {
                await warehouseService.update(editingItem.id, formData);
            } else {
                await warehouseService.create(formData);
            }
            onClose();
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await warehouseService.delete(deleteId);
                loadData();
            } catch (error) {
                console.error("Failed to delete", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    const columns: Column[] = [
        { name: t("warehouses.code"), uid: "code", sortable: true },
        { name: t("warehouses.name"), uid: "name", sortable: true },
        { name: t("warehouses.phone"), uid: "phone" },
        { name: t("warehouses.address"), uid: "address" },
        { name: t("warehouses.status"), uid: "status", align: "center" },
        { name: t("common.actions"), uid: "actions", align: "center" }
    ];

    const renderCell = useCallback((item: Warehouse, columnKey: React.Key) => {
        switch (columnKey) {
            case "code":
                return <span className="font-mono text-small">{item.code}</span>;
            case "name":
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-small">{item.name}</span>
                        {item.email && (
                            <div className="flex items-center gap-1 text-tiny text-default-400">
                                <Mail size={12} /> {item.email}
                            </div>
                        )}
                    </div>
                );
            case "phone":
                return item.phone ? (
                    <div className="flex items-center gap-2 text-small">
                        <Phone size={14} className="text-default-400" />
                        {item.phone}
                    </div>
                ) : <span className="text-default-300">-</span>;
            case "address":
                return item.address ? (
                    <div className="flex items-start gap-2 text-small max-w-[200px]">
                        <MapPin size={14} className="text-default-400 mt-1 shrink-0" />
                        <span className="truncate">{item.address}</span>
                    </div>
                ) : <span className="text-default-300">-</span>;
            case "status":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={item.isActive ? "success" : "default"}
                        size="sm"
                        variant="dot"
                    >
                        {item.isActive ? t("warehouses.active") : t("warehouses.inactive")}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content={t("common.detail") || "View Detail"}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors" onClick={() => router.push(`/super-admin/warehouse/${item.id}`)}>
                                <Eye size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip content={t("common.edit")}>
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors" onClick={() => handleEdit(item)}>
                                <Edit size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content={t("common.delete")}>
                            <span className="text-lg text-danger cursor-pointer active:opacity-50 hover:opacity-100 transition-opacity" onClick={() => confirmDelete(item.id)}>
                                <Trash size={18} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return (item as any)[columnKey as string];
        }
    }, [t, router]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{t("warehouses.title")}</h2>
                    <p className="text-default-500 text-sm">{t("warehouses.list")}</p>
                </div>
            </div>

            <DataTable
                data={warehouses}
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
                    { name: t("warehouses.active"), uid: "active" },
                    { name: t("warehouses.inactive"), uid: "inactive" }
                ]}
                onAddNew={handleCreate}
                renderCell={renderCell}
            />

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {editingItem ? t("warehouses.editWarehouse") : t("warehouses.addWarehouse")}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        autoFocus
                                        label={t("warehouses.code")}
                                        placeholder="WH-001"
                                        variant="bordered"
                                        value={formData.warehouse_code}
                                        onValueChange={(val) => setFormData({ ...formData, warehouse_code: val })}
                                        isRequired
                                    />
                                    <Input
                                        label={t("warehouses.name")}
                                        placeholder="Main Warehouse"
                                        variant="bordered"
                                        value={formData.warehouse_name}
                                        onValueChange={(val) => setFormData({ ...formData, warehouse_name: val })}
                                        isRequired
                                    />
                                </div>
                                <Input
                                    label={t("warehouses.email")}
                                    placeholder="contact@warehouse.com"
                                    variant="bordered"
                                    startContent={<Mail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" size={16} />}
                                    value={formData.warehouse_email}
                                    onValueChange={(val) => setFormData({ ...formData, warehouse_email: val })}
                                />
                                <Input
                                    label={t("warehouses.phone")}
                                    placeholder="02-123-4567"
                                    variant="bordered"
                                    startContent={<Phone className="text-2xl text-default-400 pointer-events-none flex-shrink-0" size={16} />}
                                    value={formData.warehouse_phone}
                                    onValueChange={(val) => setFormData({ ...formData, warehouse_phone: val })}
                                />
                                <Textarea
                                    label={t("warehouses.address")}
                                    placeholder="123 Street..."
                                    variant="bordered"
                                    value={formData.warehouse_address}
                                    onValueChange={(val) => setFormData({ ...formData, warehouse_address: val })}
                                />
                                <div className="flex justify-between items-center py-2 px-1">
                                    <span className="text-small text-default-500">{t("warehouses.active")}</span>
                                    <Switch
                                        size="sm"
                                        color="success"
                                        isSelected={formData.is_active}
                                        onValueChange={(val) => setFormData({ ...formData, is_active: val })}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
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
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={t("common.confirmDelete")}
                message={t("common.confirmDeleteMessage")}
            />
        </div>
    );
}
