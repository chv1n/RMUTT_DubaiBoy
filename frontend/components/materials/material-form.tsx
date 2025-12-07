"use client";

import React, { useEffect, useState } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "@/components/providers/language-provider";
import { materialService, materialGroupService, containerTypeService, materialUnitService } from "@/services/material.service";
import { Material, CreateMaterialDTO, MaterialGroup, ContainerType, MaterialUnit } from "@/types/materials";
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
    const [units, setUnits] = useState<MaterialUnit[]>([]);

    const [formData, setFormData] = useState<CreateMaterialDTO>({
        material_name: "",
        material_group_id: 0,
        order_leadtime: 0,
        container_type_id: 0,
        quantity_per_container: 0,
        unit_id: 0,
        container_min_stock: 0,
        container_max_stock: 0,
        lifetime: 0,
        lifetime_unit: "month",
        supplier_id: 0, // Need to handle supplier selection maybe? or optional
        cost_per_unit: 0,
        active: 1
    });

    useEffect(() => {
        loadDependencies();
        if (initialData) {
            setFormData({
                material_name: initialData.name,
                material_group_id: initialData.materialGroupId,
                order_leadtime: initialData.orderLeadTime,
                container_type_id: initialData.containerTypeId,
                quantity_per_container: initialData.quantity, // mapped from quantity_per_container
                unit_id: initialData.unit, // Use unit name as ID as per requirement "KG"
                container_min_stock: initialData.minStockLevel,
                container_max_stock: initialData.containerMaxStock,
                lifetime: initialData.lifetime,
                lifetime_unit: initialData.lifetimeUnit,
                supplier_id: initialData.supplierId,
                cost_per_unit: initialData.price,
                active: initialData.status === "active" ? 1 : 0,
                expiration_date: initialData.expirationDate
            });
        }
    }, [initialData]);

    const loadDependencies = async () => {
        try {
            const [groupsData, containersData, unitsData] = await Promise.all([
                materialGroupService.getAll(),
                containerTypeService.getAll(),
                materialUnitService.getAll()
            ]);
            setGroups(groupsData);
            setContainers(containersData);
            setUnits(unitsData);
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
                    value={formData.material_name}
                    onValueChange={(val) => setFormData({ ...formData, material_name: val })}
                    isRequired
                    placeholder="Enter material name"
                />

                {/* SKU is generated backend/derived, usually not editable directly if auto-generated. 
                    If needed we can add a custom field but DTO doesn't have SKU.
                    We will skip SKU input as it seems to be ID based in domain logic.
                */}

                <Select
                    label={t("materials.group")}
                    selectedKeys={formData.material_group_id ? [formData.material_group_id.toString()] : []}
                    onChange={(e) => setFormData({ ...formData, material_group_id: Number(e.target.value) })}
                    isRequired
                    placeholder="Select Group"
                >
                    {groups.map((group) => (
                        <SelectItem key={String(group.id)}>
                            {group.name}
                        </SelectItem>
                    ))}
                </Select>
                <Select
                    label={t("materials.container")}
                    selectedKeys={formData.container_type_id ? [formData.container_type_id.toString()] : []}
                    onChange={(e) => setFormData({ ...formData, container_type_id: Number(e.target.value) })}
                    isRequired
                    placeholder="Select Container"
                >
                    {containers.map((container) => (
                        <SelectItem key={String(container.id)}>
                            {container.name}
                        </SelectItem>
                    ))}
                </Select>

                <Select
                    label={t("materials.unit")}
                    selectedKeys={formData.unit_id ? [String(formData.unit_id)] : []}
                    onChange={(e) => setFormData({ ...formData, unit_id: Number(e.target.value) })}
                    isRequired
                    placeholder="Select Unit"
                >
                    {units.map((unit) => (
                        <SelectItem key={unit.id}>
                            {unit.name}
                        </SelectItem>
                    ))}
                </Select>

                <Input
                    type="number"
                    label={t("materials.price")}
                    value={formData.cost_per_unit.toString()}
                    onValueChange={(val) => setFormData({ ...formData, cost_per_unit: Number(val) })}
                    isRequired
                />
                <Input
                    type="number"
                    label={t("materials.quantity")}
                    value={formData.quantity_per_container.toString()}
                    onValueChange={(val) => setFormData({ ...formData, quantity_per_container: Number(val) })}
                    isRequired
                    description="Quantity per container"
                />

                <Input
                    type="number"
                    label={t("materials.minStock")}
                    value={formData.container_min_stock.toString()}
                    onValueChange={(val) => setFormData({ ...formData, container_min_stock: Number(val) })}
                    isRequired
                    description="Min Container Stock"
                />
                <Input
                    type="number"
                    label="Max Stock"
                    value={formData.container_max_stock.toString()}
                    onValueChange={(val) => setFormData({ ...formData, container_max_stock: Number(val) })}
                    description="Max Container Stock"
                />

                <Input
                    type="number"
                    label="Lifetime"
                    value={formData.lifetime.toString()}
                    onValueChange={(val) => setFormData({ ...formData, lifetime: Number(val) })}
                />

                <Select
                    label="Lifetime Unit"
                    selectedKeys={[formData.lifetime_unit]}
                    onChange={(e) => setFormData({ ...formData, lifetime_unit: e.target.value })}
                >
                    <SelectItem key="day">Day</SelectItem>
                    <SelectItem key="month">Month</SelectItem>
                    <SelectItem key="year">Year</SelectItem>
                </Select>

                <Select
                    label={t("common.status")}
                    selectedKeys={formData.active === 1 ? ["active"] : ["inactive"]}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === "active" ? 1 : 0 })}
                    isRequired
                >
                    <SelectItem key="active">{t("common.active")}</SelectItem>
                    <SelectItem key="inactive">{t("common.inactive")}</SelectItem>
                </Select>

                <Input
                    type="date"
                    label={t("materials.expiration_date")}
                    // format date to YYYY-MM-DD for input
                    value={formData.expiration_date ? new Date(formData.expiration_date).toISOString().split('T')[0] : ""}
                    onValueChange={(val) => {
                        // When user picks date, it is YYYY-MM-DD. Convert to ISO if needed or just keep string.
                        // Backend wants "2026-01-01T00:00:00Z".
                        // We can append T00:00:00Z if valid.
                        if (val) {
                            const iso = new Date(val).toISOString();
                            setFormData({ ...formData, expiration_date: iso });
                        } else {
                            setFormData({ ...formData, expiration_date: null });
                        }
                    }}
                    placeholder="Select Date"
                />
            </div>
            {/* Description is not in backend DTO? Backend has no description field in MaterialMaster entity. 
                Skipping description. 
                If needed, we can't save it to backend as is.
            */}

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
