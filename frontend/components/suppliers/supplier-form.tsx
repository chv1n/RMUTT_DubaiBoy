"use client";

import React, { useEffect, useState } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "@/components/providers/language-provider";
import { supplierService } from "@/services/supplier.service";
import { Supplier, CreateSupplierDTO } from "@/types/suppliers";
import { useRouter } from "next/navigation";

interface SupplierFormProps {
    initialData?: Supplier;
    mode: "create" | "edit";
}

export function SupplierForm({ initialData, mode }: SupplierFormProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CreateSupplierDTO>({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                address: initialData.address || "",
                status: initialData.status === "blacklisted" ? "inactive" : initialData.status,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "edit" && initialData) {
                await supplierService.update(initialData.id, formData);
            } else {
                await supplierService.create(formData);
            }
            router.push("/super-admin/suppliers/all");
        } catch (error) {
            console.error("Failed to save supplier", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label={t("suppliers.name")}
                    value={formData.name}
                    onValueChange={(val) => setFormData({ ...formData, name: val })}
                    isRequired
                />
                <Input
                    type="email"
                    label={t("suppliers.email")}
                    value={formData.email || ""}
                    onValueChange={(val) => setFormData({ ...formData, email: val })}
                    isRequired
                />
                <Input
                    type="tel"
                    label={t("suppliers.phone")}
                    value={formData.phone || ""}
                    onValueChange={(val) => setFormData({ ...formData, phone: val })}
                    isRequired
                />
                <Select
                    label={t("common.status")}
                    selectedKeys={formData.status ? [formData.status] : []}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    isRequired
                >
                    <SelectItem key="active">{t("suppliers.active")}</SelectItem>
                    <SelectItem key="inactive">{t("suppliers.inactive")}</SelectItem>
                </Select>
            </div>
            <Textarea
                label={t("suppliers.address")}
                value={formData.address || ""}
                onValueChange={(val) => setFormData({ ...formData, address: val })}
                isRequired
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
