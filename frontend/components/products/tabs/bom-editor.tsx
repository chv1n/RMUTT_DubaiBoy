"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BOM, CreateBomDTO } from "@/types/product";
import { productService } from "@/services/product.service";
import { materialService, materialUnitService } from "@/services/material.service";
import { Material, MaterialUnit } from "@/types/materials";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Plus, Trash, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";

interface BOMEditorProps {
    productId: string;
}

export function BOMEditor({ productId }: BOMEditorProps) {
    const { t } = useTranslation();
    const { isOpen: isBomOpen, onOpen: onBomOpen, onOpenChange: onBomOpenChange, onClose: onBomClose } = useDisclosure();
    const { isOpen: isDeleteBomOpen, onOpen: onDeleteBomOpen, onOpenChange: onDeleteBomOpenChange, onClose: onDeleteBomClose } = useDisclosure();

    // Data State
    const [boms, setBoms] = useState<BOM[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [units, setUnits] = useState<MaterialUnit[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [bomLoading, setBomLoading] = useState(false);
    const [bomToDelete, setBomToDelete] = useState<number | null>(null);

    // New BOM Item State
    const [newBom, setNewBom] = useState<Partial<CreateBomDTO>>({
        material_id: 0,
        unit_id: 0,
        usage_per_piece: 1,
        scrap_factor: 0,
        active: 1,
        version: 1,
    });

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchBoms(),
                loadDependencies()
            ]);
        } catch (error) {
            console.error("Failed to load BOM data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBoms = async () => {
        try {
            const data = await productService.getBomsByProduct(Number(productId));
            setBoms(data);
        } catch (error) {
            console.error("Failed to fetch BOMs", error);
        }
    };

    const loadDependencies = async () => {
        try {
            const [mats, u] = await Promise.all([
                materialService.getAll(1, 100),
                materialUnitService.getAll()
            ]);
            setMaterials(mats.data || []);
            setUnits(u);
        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    const handleAddBom = async () => {
        if (!newBom.material_id || !newBom.usage_per_piece) return;

        setBomLoading(true);
        try {
            let unitId = newBom.unit_id;
            if (!unitId) {
                const mat = materials.find(m => m.id === newBom.material_id);
                if (mat && mat.unitId) unitId = mat.unitId;
                else if (units.length > 0) unitId = units[0].id;
            }

            const payload: CreateBomDTO = {
                product_id: Number(productId),
                material_id: Number(newBom.material_id),
                unit_id: Number(unitId),
                usage_per_piece: Number(newBom.usage_per_piece),
                scrap_factor: Number(newBom.scrap_factor || 0),
                version: 1,
                active: 1
            };

            await productService.addBom(payload);
            await fetchBoms();

            onBomClose();
            setNewBom({ material_id: 0, unit_id: 0, usage_per_piece: 1, scrap_factor: 0, active: 1, version: 1 });
        } catch (error) {
            console.error("Failed to add BOM", error);
        } finally {
            setBomLoading(false);
        }
    };

    const handleDeleteBom = (bomId: number) => {
        setBomToDelete(bomId);
        onDeleteBomOpen();
    };

    const confirmDeleteBom = async () => {
        if (!bomToDelete) return;
        setBomLoading(true);
        try {
            await productService.deleteBom(bomToDelete);
            await fetchBoms();
            onDeleteBomClose();
            setBomToDelete(null);
        } catch (error) {
            console.error("Failed to delete BOM", error);
        } finally {
            setBomLoading(false);
        }
    };

    const selectedMaterialUnitName = useMemo(() => {
        if (!newBom.material_id) return "";
        const mat = materials.find(m => m.id === Number(newBom.material_id));
        return mat ? mat.unit : "";
    }, [newBom.material_id, materials]);

    if (loading) {
        return <div className="p-4 flex justify-center">{t("common.loading")}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t("products.bomList")}</h3>
                <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={onBomOpen}>
                    {t("products.addBom")}
                </Button>
            </div>

            <Card>
                <CardBody className="p-0">
                    <Table aria-label="BOM Table" shadow="none" classNames={{ wrapper: "rounded-none shadow-none" }}>
                        <TableHeader>
                            <TableColumn>{t("products.fields.material")}</TableColumn>
                            <TableColumn>{t("products.fields.quantity")}</TableColumn>
                            <TableColumn>{t("products.fields.unit")}</TableColumn>
                            <TableColumn>{t("products.fields.waste")}</TableColumn>
                            <TableColumn>{t("products.fields.cost")} (Est.)</TableColumn>
                            <TableColumn align="center">{t("common.actions")}</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No materials added yet."} items={boms}>
                            {(bom) => (
                                <TableRow key={bom.id}>
                                    <TableCell>{bom.materialName}</TableCell>
                                    <TableCell>{bom.quantity}</TableCell>
                                    <TableCell>{bom.unitName}</TableCell>
                                    <TableCell>{bom.wastePercent}%</TableCell>
                                    <TableCell>
                                        {((bom.costPerUnit || 0) * bom.quantity).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <span className="text-danger cursor-pointer active:opacity-50" onClick={() => handleDeleteBom(bom.id)}>
                                                <Trash size={18} />
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* BOM Modal */}
            <Modal isOpen={isBomOpen} onOpenChange={onBomOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{t("products.addBom")}</ModalHeader>
                            <ModalBody>
                                <Select
                                    label={t("products.fields.material")}
                                    placeholder="Select material"
                                    selectedKeys={newBom.material_id ? [newBom.material_id.toString()] : []}
                                    onChange={(e) => setNewBom({ ...newBom, material_id: Number(e.target.value) })}
                                >
                                    {materials.map((mat) => (
                                        <SelectItem key={mat.id} textValue={mat.name}>
                                            <div className="flex justify-between items-center w-full">
                                                <span>{mat.name}</span>
                                                <span className="text-tiny text-default-400">{mat.sku}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label={t("products.fields.quantity")}
                                        value={newBom.usage_per_piece?.toString()}
                                        onValueChange={(v) => setNewBom({ ...newBom, usage_per_piece: Number(v) })}
                                    />
                                    <Input
                                        type="number"
                                        label={t("products.fields.waste")}
                                        placeholder="0"
                                        endContent="%"
                                        value={newBom.scrap_factor?.toString()}
                                        onValueChange={(v) => setNewBom({ ...newBom, scrap_factor: Number(v) })}
                                    />
                                </div>

                                <Select
                                    label={t("products.fields.unit")}
                                    placeholder="Select unit"
                                    selectedKeys={newBom.unit_id ? [newBom.unit_id.toString()] : []}
                                    onChange={(e) => setNewBom({ ...newBom, unit_id: Number(e.target.value) })}
                                    description={selectedMaterialUnitName ? `Default: ${selectedMaterialUnitName}` : ""}
                                >
                                    {units.map((u) => (
                                        <SelectItem key={u.id}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" color="danger" onPress={onClose}>{t("common.cancel")}</Button>
                                <Button color="primary" onPress={handleAddBom} isLoading={bomLoading}>{t("common.add")}</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteBomOpen} onOpenChange={onDeleteBomOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Confirm Delete</ModalHeader>
                            <ModalBody>
                                <p>{t("common.confirmDeleteMessage")}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    {t("common.cancel")}
                                </Button>
                                <Button color="danger" onPress={confirmDeleteBom} isLoading={bomLoading}>
                                    {t("common.delete")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
