"use client";

import React, { useEffect, useState } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "@/components/providers/language-provider";
import { materialService, materialGroupService, containerTypeService } from "@/services/material.service";
import { Material, CreateMaterialDTO, MaterialGroup, ContainerType } from "@/types/materials";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

interface MaterialFormProps {
    initialData?: Material;
    mode: "create" | "edit";
}

export function MaterialForm({ initialData, mode }: MaterialFormProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<MaterialGroup[]>([]);
    const [containers, setContainers] = useState<ContainerType[]>([]);

    const [formData, setFormData] = useState<CreateMaterialDTO>({
        name: "",
        description: "",
        sku: "",
        price: 0,
        quantity: 0,
        unit: "",
        minStockLevel: 0,
        materialGroupId: 0,
        containerTypeId: 0,
        status: "active",
        imageUrl: ""
    });

    useEffect(() => {
        loadDependencies();
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                sku: initialData.sku,
                price: initialData.price,
                quantity: initialData.quantity,
                unit: initialData.unit,
                minStockLevel: initialData.minStockLevel,
                materialGroupId: initialData.materialGroupId,
                containerTypeId: initialData.containerTypeId,
                status: initialData.status,
                imageUrl: initialData.imageUrl
            });
        }
    }, [initialData]);

    const loadDependencies = async () => {
        try {
            const [groupsData, containersData] = await Promise.all([
                materialGroupService.getAll(),
                containerTypeService.getAll()
            ]);
            setGroups(groupsData);
            setContainers(containersData);
        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "edit" && initialData) {
                await materialService.update(initialData.id, formData);
            } else {
                await materialService.create(formData);
            }
            router.push("/super-admin/materials/all");
        } catch (error) {
            console.error("Failed to save material", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label={t("materials.name")}
                    value={formData.name}
                    onValueChange={(val) => setFormData({ ...formData, name: val })}
                    isRequired
                />
                <Input
                    label={t("materials.sku")}
                    value={formData.sku}
                    onValueChange={(val) => setFormData({ ...formData, sku: val })}
                    isRequired
                />
                <Select
                    label={t("materials.group")}
                    selectedKeys={formData.materialGroupId ? [formData.materialGroupId.toString()] : []}
                    onChange={(e) => setFormData({ ...formData, materialGroupId: Number(e.target.value) })}
                    isRequired
                >
                    {groups.map((group) => (
                        <SelectItem key={group.id}>
                            {group.name}
                        </SelectItem>
                    ))}
                </Select>
                <Select
                    label={t("materials.container")}
                    selectedKeys={formData.containerTypeId ? [formData.containerTypeId.toString()] : []}
                    onChange={(e) => setFormData({ ...formData, containerTypeId: Number(e.target.value) })}
                    isRequired
                >
                    {containers.map((container) => (
                        <SelectItem key={container.id}>
                            {container.name}
                        </SelectItem>
                    ))}
                </Select>
                <Input
                    type="number"
                    label={t("materials.price")}
                    value={formData.price.toString()}
                    onValueChange={(val) => setFormData({ ...formData, price: Number(val) })}
                    isRequired
                />
                <Input
                    type="number"
                    label={t("materials.quantity")}
                    value={formData.quantity.toString()}
                    onValueChange={(val) => setFormData({ ...formData, quantity: Number(val) })}
                    isRequired
                />
                <Input
                    label={t("materials.unit")}
                    value={formData.unit}
                    onValueChange={(val) => setFormData({ ...formData, unit: val })}
                    isRequired
                />
                <Input
                    type="number"
                    label={t("materials.minStock")}
                    value={formData.minStockLevel.toString()}
                    onValueChange={(val) => setFormData({ ...formData, minStockLevel: Number(val) })}
                    isRequired
                />
                <Select
                    label={t("common.status")}
                    selectedKeys={[formData.status]}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    isRequired
                >
                    <SelectItem key="active">{t("common.active")}</SelectItem>
                    <SelectItem key="inactive">{t("common.inactive")}</SelectItem>
                </Select>
            </div>
            <Textarea
                label={t("materials.description")}
                value={formData.description}
                onValueChange={(val) => setFormData({ ...formData, description: val })}
            />
            <div className="flex gap-2 justify-end">
                <Button color="danger" variant="light" onPress={() => router.back()}>
                    {t("common.cancel")}
                </Button>
                <Button color="primary" type="submit" isLoading={loading}>
                    {t("common.save")}
                </Button>
            </div>
        </form>
    );
}
