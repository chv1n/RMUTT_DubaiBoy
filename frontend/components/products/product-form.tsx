"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useTranslation } from "@/components/providers/language-provider";
import { productService } from "@/services/product.service";
import { materialService, materialUnitService } from "@/services/material.service";
import { Product, ProductType, BOM, CreateBomDTO } from "@/types/product";
import { Material, MaterialUnit } from "@/types/materials";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, Trash, AlertCircle } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Chip } from "@heroui/chip";

interface ProductFormProps {
    initialData?: Product | null;
    mode: "create" | "edit";
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ProductForm({ initialData, mode: initialMode, onSuccess, onCancel }: ProductFormProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { isOpen: isBomOpen, onOpen: onBomOpen, onOpenChange: onBomOpenChange, onClose: onBomClose } = useDisclosure();
    const { isOpen: isDeleteBomOpen, onOpen: onDeleteBomOpen, onOpenChange: onDeleteBomOpenChange, onClose: onDeleteBomClose } = useDisclosure();
    const [bomToDelete, setBomToDelete] = useState<number | null>(null);

    // Mode handling (can switch from create to edit)
    const [mode, setMode] = useState(initialMode);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(initialData || null);

    // Core State
    const [loading, setLoading] = useState(false);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [activeTab, setActiveTab] = useState("info");

    // Data State
    const [formData, setFormData] = useState({
        name: "",
        typeId: 0,
        isActive: true
    });

    // BOM State
    const [boms, setBoms] = useState<BOM[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [units, setUnits] = useState<MaterialUnit[]>([]);

    // New BOM Item State
    const [newBom, setNewBom] = useState<Partial<CreateBomDTO>>({
        material_id: 0,
        unit_id: 0,
        usage_per_piece: 1,
        scrap_factor: 0,
        active: 1,
        version: 1,
    });
    const [bomLoading, setBomLoading] = useState(false);

    useEffect(() => {
        loadDependencies();
    }, []);

    useEffect(() => {
        if (initialData) {
            setCurrentProduct(initialData);
            setMode("edit");
        } else if (initialMode === "create") {
            setCurrentProduct(null);
            setMode("create");
            setFormData({ name: "", typeId: 0, isActive: true });
            setBoms([]);
        }
    }, [initialData, initialMode]);

    useEffect(() => {
        if (currentProduct) {
            setFormData({
                name: currentProduct.name,
                typeId: currentProduct.typeId,
                isActive: currentProduct.isActive
            });
            fetchBoms(currentProduct.id);
        }
    }, [currentProduct]);

    const fetchBoms = async (productId: number) => {
        try {
            const fetchedBoms = await productService.getBomsByProduct(productId);
            setBoms(fetchedBoms);
        } catch (error) {
            console.error("Failed to fetch BOMs", error);
        }
    };

    const loadDependencies = async () => {
        try {
            const [types, mats, u] = await Promise.all([
                productService.getTypes(),
                materialService.getAll(1, 100), // Get first 100 for now, ideally dropdown with search
                materialUnitService.getAll()
            ]);
            setProductTypes(types);
            setMaterials(mats.data || []);
            setUnits(u);
        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "edit" && currentProduct) {
                await productService.update(currentProduct.id, {
                    product_name: formData.name,
                    product_type_id: Number(formData.typeId),
                    // active mapping if needed
                });
                if (onSuccess) onSuccess();
            } else {
                const newProduct = await productService.create({
                    product_name: formData.name,
                    product_type_id: Number(formData.typeId)
                });
                // Switch to edit mode in place
                setCurrentProduct(newProduct);
                setMode("edit");
                // Don't close modal, let user add BOMs
                // if (onSuccess) onSuccess(); 
            }
        } catch (error) {
            console.error("Failed to save product", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBom = async () => {
        if (!currentProduct || !newBom.material_id || !newBom.usage_per_piece) return;

        setBomLoading(true);
        try {
            let unitId = newBom.unit_id;
            if (!unitId) {
                const mat = materials.find(m => m.id === newBom.material_id);
                if (mat && mat.unitId) unitId = mat.unitId;
                else if (units.length > 0) unitId = units[0].id;
            }

            const payload: CreateBomDTO = {
                product_id: currentProduct.id,
                material_id: Number(newBom.material_id),
                unit_id: Number(unitId),
                usage_per_piece: Number(newBom.usage_per_piece),
                scrap_factor: Number(newBom.scrap_factor || 0),
                version: 1,
                active: 1
            };

            await productService.addBom(payload);
            await fetchBoms(currentProduct.id);

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
            if (currentProduct) {
                await fetchBoms(currentProduct.id);
            }
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

    const handleCancel = () => {
        if (onCancel) onCancel();
        else router.back();
    };

    return (
        <div className="space-y-6 w-full h-full">
            <Tabs aria-label="Product Options" selectedKey={activeTab} onSelectionChange={(k) => setActiveTab(k as string)} color="primary" variant="underlined">
                <Tab key="info" title={
                    <div className="flex items-center gap-2">
                        <span>{t("products.tabs.info")}</span>
                    </div>
                }>
                    <Card className="shadow-none border-none bg-transparent">
                        <CardBody className="p-0">
                            <form onSubmit={handleSaveProduct} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label={t("products.fields.name")}
                                        placeholder="Enter product name"
                                        value={formData.name}
                                        onValueChange={(val) => setFormData({ ...formData, name: val })}
                                        isRequired
                                    />
                                    <Select
                                        label={t("products.fields.type")}
                                        placeholder="Select type"
                                        selectedKeys={formData.typeId ? [formData.typeId.toString()] : []}
                                        onChange={(e) => setFormData({ ...formData, typeId: Number(e.target.value) })}
                                        isRequired
                                    >
                                        {productTypes.map((type) => (
                                            <SelectItem key={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label={t("products.fields.active")}
                                        selectedKeys={formData.isActive ? ["opt_active"] : ["opt_inactive"]}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "opt_active" })}
                                    >
                                        <SelectItem key="opt_active">{t("common.active")}</SelectItem>
                                        <SelectItem key="opt_inactive">{t("common.inactive")}</SelectItem>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="light" color="danger" onPress={handleCancel}>
                                        {t("common.cancel")}
                                    </Button>
                                    <Button color="primary" type="submit" isLoading={loading} startContent={<Save size={18} />}>
                                        {t("common.save")}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="bom" title={
                    <div className="flex items-center gap-2">
                        <span>{t("products.tabs.bom")}</span>
                        {boms.length > 0 && <Chip size="sm" variant="flat">{boms.length}</Chip>}
                    </div>
                } isDisabled={mode === "create"}>
                    <Card className="shadow-none border-none bg-transparent">
                        <CardBody className="p-0 space-y-4">
                            {mode === "create" ? (
                                <div className="flex flex-col items-center justify-center p-8 text-default-400">
                                    <AlertCircle size={32} className="mb-2" />
                                    <p>Please save the product first to add BOM.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">{t("products.bomList")}</h3>
                                        <Button color="primary" size="sm" startContent={<Plus size={16} />} onPress={onBomOpen}>
                                            {t("products.addBom")}
                                        </Button>
                                    </div>

                                    <Table aria-label="BOM Table" shadow="none" classNames={{ wrapper: "p-0" }}>
                                        <TableHeader>
                                            <TableColumn>{t("products.fields.material")}</TableColumn>
                                            <TableColumn>{t("products.fields.quantity")}</TableColumn>
                                            <TableColumn>{t("products.fields.unit")}</TableColumn>
                                            <TableColumn>{t("products.fields.waste")}</TableColumn>
                                            <TableColumn>{t("products.fields.cost")} (Est.)</TableColumn>
                                            <TableColumn align="center">{t("common.actions")}</TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent={"No materials added yet."}>
                                            {boms.map((bom) => (
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>

            {/* BOM Modal - Nested */}
            <Modal isOpen={isBomOpen} onClose={() => onBomClose()} size="3xl" placement="center" backdrop="blur" portalContainer={document.body}>
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

            {/* Delete Confirmation Modal - Nested */}
            <Modal isOpen={isDeleteBomOpen} onOpenChange={onDeleteBomOpenChange} placement="center" backdrop="blur" portalContainer={document.body}>
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
