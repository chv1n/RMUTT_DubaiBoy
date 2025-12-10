
"use client";

import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "react-i18next";
import { inventoryService } from "@/services/inventory.service";
import { materialService } from "@/services/material.service";
import { warehouseService } from "@/services/warehouse.service";
import { Material } from "@/types/materials";
import { Warehouse } from "@/types/warehouse";
import { addToast } from "@heroui/toast";

type ActionType = "IN" | "OUT" | "ADJUST" | "TRANSFER";

interface InventoryActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultAction?: ActionType;
    defaultMaterialId?: number;
    defaultWarehouseId?: number;
}

export const InventoryActionModal = ({
    isOpen,
    onClose,
    onSuccess,
    defaultAction = "IN",
    defaultMaterialId,
    defaultWarehouseId
}: InventoryActionModalProps) => {
    const { t } = useTranslation();
    const [actionType, setActionType] = useState<ActionType>(defaultAction);
    const [isLoading, setIsLoading] = useState(false);

    // Lists
    const [materials, setMaterials] = useState<Material[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    // Form State
    const [form, setForm] = useState({
        materialId: defaultMaterialId ? String(defaultMaterialId) : "",
        warehouseId: defaultWarehouseId ? String(defaultWarehouseId) : "",
        targetWarehouseId: "", // For transfer
        quantity: "",
        referenceNumber: "",
        reason: "",
        lotNumber: "",
        mfgDate: "",
        expDate: ""
    });

    useEffect(() => {
        if (isOpen) {
            loadDependencies();
            setActionType(defaultAction);
            setForm(prev => ({
                ...prev,
                materialId: defaultMaterialId ? String(defaultMaterialId) : "",
                warehouseId: defaultWarehouseId ? String(defaultWarehouseId) : ""
            }));
        }
    }, [isOpen, defaultAction, defaultMaterialId, defaultWarehouseId]);

    const loadDependencies = async () => {
        try {
            const [matRes, whRes] = await Promise.all([
                materialService.getAll(1, 100), // Get first 100 materials for dropdown
                warehouseService.getAll(1, 100) // Get first 100 warehouses
            ]);

            if (matRes.success) setMaterials(matRes.data);
            if (whRes.success) setWarehouses(whRes.data);

        } catch (error) {
            console.error("Failed to load dependencies", error);
            addToast({
                title: t('common.error'),
                color: "danger"
            });
        }
    };

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const quantity = Number(form.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                addToast({
                    title: "Invalid quantity",
                    color: "danger"
                });
                return;
            }

            if (!form.materialId || !form.warehouseId) {
                addToast({
                    title: "Material and Warehouse are required",
                    color: "danger"
                });
                return;
            }

            let response;
            if (actionType === "IN") {
                response = await inventoryService.recordGoodsReceipt({
                    material_id: Number(form.materialId),
                    warehouse_id: Number(form.warehouseId),
                    quantity: quantity,
                    reference_number: form.referenceNumber,
                    reason_remarks: form.reason,
                    order_number: form.lotNumber,
                    mfg_date: form.mfgDate ? new Date(form.mfgDate).toISOString() : undefined,
                    exp_date: form.expDate ? new Date(form.expDate).toISOString() : undefined,
                });
            } else if (actionType === "OUT") {
                response = await inventoryService.recordGoodsIssue({
                    material_id: Number(form.materialId),
                    warehouse_id: Number(form.warehouseId),
                    quantity: quantity,
                    reference_number: form.referenceNumber || "Manual Issue", // Required
                    reason_remarks: form.reason
                });
            } else if (actionType === "ADJUST") {
                response = await inventoryService.recordAdjustment({
                    material_id: Number(form.materialId),
                    warehouse_id: Number(form.warehouseId),
                    quantity_change: quantity,
                    reason_remarks: form.reason || "Manual Adjustment",
                    reference_number: form.referenceNumber
                });
            } else if (actionType === "TRANSFER") {
                if (!form.targetWarehouseId) {
                    addToast({
                        title: "Target Warehouse required",
                        color: "danger"
                    });
                    return;
                }
                response = await inventoryService.recordTransfer({
                    material_id: Number(form.materialId),
                    source_warehouse_id: Number(form.warehouseId),
                    target_warehouse_id: Number(form.targetWarehouseId),
                    quantity: quantity,
                    reference_number: form.referenceNumber,
                    reason_remarks: form.reason
                });
            }

            if (response && response.success) {
                addToast({
                    title: t('common.success'),
                    color: "success"
                });
                onSuccess();
                onClose();
            } else {
                addToast({
                    title: t('common.error'),
                    color: "danger"
                });
            }

        } catch (error) {
            console.error("Transaction failed", error);
            addToast({
                title: t('common.error'),
                color: "danger"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {t('inventory.transactions')} - {actionType}
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex gap-2 mb-4">
                                <Button
                                    color={actionType === "IN" ? "primary" : "default"}
                                    onPress={() => setActionType("IN")}
                                >
                                    {t("inventory.goodsReceipt")}
                                </Button>
                                <Button
                                    color={actionType === "OUT" ? "primary" : "default"}
                                    onPress={() => setActionType("OUT")}
                                >
                                    {t("inventory.goodsIssue")}
                                </Button>
                                <Button
                                    color={actionType === "ADJUST" ? "primary" : "default"}
                                    onPress={() => setActionType("ADJUST")}
                                >
                                    {t("inventory.adjustment")}
                                </Button>
                                <Button
                                    color={actionType === "TRANSFER" ? "primary" : "default"}
                                    onPress={() => setActionType("TRANSFER")}
                                >
                                    {t("inventory.transfer")}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label={t('inventory.fields.sourceWarehouse')}
                                    selectedKeys={form.warehouseId ? [form.warehouseId] : []}
                                    onChange={(e) => handleChange("warehouseId", e.target.value)}
                                    placeholder="Select Warehouse"
                                >
                                    {warehouses.map((w) => (
                                        <SelectItem key={String(w.id)}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </Select>

                                {actionType === "TRANSFER" && (
                                    <Select
                                        label={t('inventory.fields.targetWarehouse')}
                                        selectedKeys={form.targetWarehouseId ? [form.targetWarehouseId] : []}
                                        onChange={(e) => handleChange("targetWarehouseId", e.target.value)}
                                        placeholder="Select Target Warehouse"
                                    >
                                        {warehouses.filter(w => String(w.id) !== form.warehouseId).map((w) => (
                                            <SelectItem key={String(w.id)}>
                                                {w.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}

                                <Select
                                    label="Material"
                                    selectedKeys={form.materialId ? [form.materialId] : []}
                                    onChange={(e) => handleChange("materialId", e.target.value)}
                                    placeholder="Select Material"
                                >
                                    {materials.map((m) => (
                                        <SelectItem key={String(m.id)} textValue={m.name}>
                                            <div className="flex flex-col">
                                                <span>{m.name}</span>
                                                <span className="text-tiny text-default-400">{m.sku}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Input
                                    type="number"
                                    label={t('inventory.fields.quantity')}
                                    value={form.quantity}
                                    onValueChange={(v) => handleChange("quantity", v)}
                                />

                                <Input
                                    label={t('inventory.fields.reference')}
                                    value={form.referenceNumber}
                                    onValueChange={(v) => handleChange("referenceNumber", v)}
                                />

                                {actionType === "IN" && (
                                    <>
                                        <Input
                                            label={t('inventory.fields.orderNumber')}
                                            value={form.lotNumber}
                                            onValueChange={(v) => handleChange("lotNumber", v)}
                                        />
                                        <Input
                                            type="date"
                                            label={t('inventory.fields.mfgDate')}
                                            value={form.mfgDate}
                                            onValueChange={(v) => handleChange("mfgDate", v)}
                                            placeholder="YYYY-MM-DD"
                                        />
                                        <Input
                                            type="date"
                                            label={t('inventory.fields.expDate')}
                                            value={form.expDate}
                                            onValueChange={(v) => handleChange("expDate", v)}
                                            placeholder="YYYY-MM-DD"
                                        />
                                    </>
                                )}

                                <div className="md:col-span-2">
                                    <Textarea
                                        label={t('inventory.fields.reason')}
                                        value={form.reason}
                                        onValueChange={(v) => handleChange("reason", v)}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>
                                {t('common.save')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
